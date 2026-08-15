import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertyGallery } from '@/components/properties/PropertyGallery';
import { RoomsSection } from '@/components/properties/RoomsSection';
import { ContactPanel } from '@/components/properties/ContactPanel';
import { FavoriteButton } from '@/components/properties/FavoriteButton';
import { ShareButton } from '@/components/properties/ShareButton';
import { PropertyMap } from '@/components/properties/PropertyMap';
import { ReviewsSection } from '@/components/properties/ReviewsSection';
import { SimilarProperties } from '@/components/properties/SimilarProperties';
import { RecentlyViewedTracker } from '@/components/properties/RecentlyViewedTracker';
import { MapPin, Users, BedDouble, Bath, Home } from 'lucide-react';
import { formatPriceILS } from '@/lib/utils';
import type { Metadata } from 'next';

async function getProperty(slugOrId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const selectQuery = `
    *, cities(name_he), rooms(*, room_images(*), room_amenities(amenities(name_he))),
    property_images(*), property_amenities(amenities(id, name_he, key)), prices(*),
    favorites(user_id)
  `;

  const bySlug = await supabase.from('properties').select(selectQuery).eq('slug', slugOrId).maybeSingle();
  const property = bySlug.data ?? (
    await supabase.from('properties').select(selectQuery).eq('id', slugOrId).maybeSingle()
  ).data;

  return { property, currentUserId: user?.id };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { property } = await getProperty(params.slug);
  if (!property) return {};
  return {
    title: property.seo_title || property.name,
    description: property.seo_description || property.description?.slice(0, 155),
  };
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const { property, currentUserId } = await getProperty(params.slug);
  if (!property) notFound();

  const supabase = createClient();
  const isOwnerViewing = currentUserId === property.owner_id;
  if (property.status !== 'approved' && !isOwnerViewing) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'admin';
  }
  if (property.status !== 'approved' && !isOwnerViewing && !isAdmin) notFound();

  const price = property.prices?.[0];
  const isFavorited = user ? property.favorites?.some((f: any) => f.user_id === user.id) : false;
  const amenities = property.property_amenities?.map((pa: any) => pa.amenities).filter(Boolean) ?? [];

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LodgingBusiness',
            name: property.name,
            description: property.description,
            image: property.cover_image_url ?? undefined,
            address: {
              '@type': 'PostalAddress',
              streetAddress: property.address_visible ? property.address : undefined,
              addressLocality: property.cities?.name_he,
              addressCountry: property.country_code,
            },
            geo: property.lat && property.lng ? {
              '@type': 'GeoCoordinates',
              latitude: property.lat,
              longitude: property.lng,
            } : undefined,
            telephone: property.phone ? `${property.phone_country_code ?? ''}${property.phone}` : undefined,
            priceRange: price ? `${price.weekday_price}-${price.weekend_price} ILS` : undefined,
          }),
        }}
      />
      <main className="bg-cream">
        <RecentlyViewedTracker propertyId={property.id} />
        <div className="mx-auto max-w-6xl px-5 md:px-8 pt-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display">{property.name}</h1>
              <p className="flex items-center gap-1 text-charcoal/50 mt-1.5 text-sm">
                <MapPin size={15} />
                {property.address_visible ? property.address : `${property.cities?.name_he ?? ''} (מיקום משוער)`}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <ShareButton title={property.name} />
              <FavoriteButton propertyId={property.id} initialFavorited={!!isFavorited} isLoggedIn={!!user} />
            </div>
          </div>

          <PropertyGallery images={property.property_images ?? []} coverImageUrl={property.cover_image_url} />

          <div className="grid md:grid-cols-3 gap-10 mt-10">
            <div className="md:col-span-2 space-y-10">
              <div className="flex flex-wrap gap-6 text-sm text-charcoal/70 border-b border-charcoal/10 pb-6">
                <span className="flex items-center gap-2"><Users size={17} className="text-brass" /> {property.max_guests} אורחים</span>
                <span className="flex items-center gap-2"><Home size={17} className="text-brass" /> {property.num_rooms} חדרים</span>
                <span className="flex items-center gap-2"><BedDouble size={17} className="text-brass" /> {property.num_beds} מיטות</span>
                <span className="flex items-center gap-2"><Bath size={17} className="text-brass" /> {property.num_bathrooms} חדרי רחצה</span>
              </div>

              <div>
                <h2 className="font-display text-xl mb-3">אודות הנכס</h2>
                <p className="text-charcoal/70 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {amenities.length > 0 && (
                <div>
                  <h2 className="font-display text-xl mb-3">שירותים ומתקנים</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm text-charcoal/70">
                    {amenities.map((a: any) => <div key={a.id}>{a.name_he}</div>)}
                  </div>
                </div>
              )}

              <RoomsSection rooms={property.rooms ?? []} />

              <ReviewsSection propertyId={property.id} />

              {property.lat && property.lng && (
                <div>
                  <h2 className="font-display text-xl mb-3">מיקום</h2>
                  <PropertyMap
                    properties={[{
                      id: property.id, slug: property.slug, name: property.name,
                      lat: property.address_visible ? property.lat : (property.approx_lat ?? property.lat),
                      lng: property.address_visible ? property.lng : (property.approx_lng ?? property.lng),
                      coverImageUrl: property.cover_image_url,
                    }]}
                    height="360px"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="sticky top-28 bg-white rounded-3xl border border-forest/8 shadow-card p-6">
                {price && (
                  <div className="mb-4">
                    <p className="text-2xl font-display text-forest">{formatPriceILS(price.weekday_price)}</p>
                    <p className="text-xs text-charcoal/50">ללילה בימי חול · {formatPriceILS(price.weekend_price)} בסופ״ש</p>
                  </div>
                )}
                <ContactPanel
                  propertyId={property.id}
                  phone={`${property.phone_country_code ?? ''}${property.phone ?? ''}`}
                  whatsapp={property.whatsapp_number}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 md:px-8 py-10 border-t border-charcoal/8 mt-4">
          <SimilarProperties propertyId={property.id} cityId={property.city_id} propertyType={property.property_type} />
        </div>
      </main>
      <Footer />
    </>
  );
}
