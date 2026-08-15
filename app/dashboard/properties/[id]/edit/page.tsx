import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EditPropertyForm } from '@/components/dashboard/EditPropertyForm';
import { AvailabilityPricingManager } from '@/components/dashboard/AvailabilityPricingManager';

export const metadata = { title: 'עריכת נכס' };

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/dashboard/properties/${params.id}/edit`);

  const { data: property } = await supabase
    .from('properties')
    .select(`
      *, rooms(*, room_images(*)), property_images(*), prices(*),
      property_amenities(amenity_id)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (!property) notFound();

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (property.owner_id !== user.id && profile?.role !== 'admin') redirect('/dashboard');

  const { data: amenities } = await supabase.from('amenities').select('id, name_he').eq('is_active', true).order('sort_order');

  const [{ data: availabilityBlocks }, { data: seasonalPrices }, { data: specialOffers }] = await Promise.all([
    supabase.from('availability_blocks').select('id, start_date, end_date, note').eq('property_id', property.id).order('start_date'),
    supabase.from('seasonal_prices').select('id, label, start_date, end_date, weekday_price, weekend_price').eq('property_id', property.id).order('start_date'),
    supabase.from('special_offers').select('id, title, discount_percent, start_date, end_date').eq('property_id', property.id),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-sage-light py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl">{property.name}</h1>
            <StatusBadge status={property.status} />
          </div>
          {property.rejection_reason && (property.status === 'rejected' || property.status === 'needs_changes') && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
              <strong>הערת הצוות:</strong> {property.rejection_reason}
            </div>
          )}
          <EditPropertyForm property={property} amenities={amenities ?? []} />

          <div className="mt-8">
            <AvailabilityPricingManager
              propertyId={property.id}
              availabilityBlocks={availabilityBlocks ?? []}
              seasonalPrices={seasonalPrices ?? []}
              specialOffers={specialOffers ?? []}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
