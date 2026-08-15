import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReferenceDataManager } from '@/components/admin/ReferenceDataManager';
import { ManualPropertyForm } from '@/components/admin/ManualPropertyForm';
import Link from 'next/link';

export const metadata = { title: 'ערים ושירותים' };

export default async function AdminCitiesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin/cities');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const [{ data: cities }, { data: amenities }, { data: categories }] = await Promise.all([
    supabase.from('cities').select('id, name_he, region, is_active').order('name_he'),
    supabase.from('amenities').select('id, key, name_he, group, is_active').order('sort_order'),
    supabase.from('categories').select('id, key, name_he, is_active').order('sort_order'),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-sage-light py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="eyebrow">ניהול אתר</span>
              <h1 className="text-2xl md:text-3xl mt-2">ערים, שירותים וקטגוריות</h1>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link href="/admin/properties" className="text-charcoal/50 hover:text-forest">נכסים</Link>
              <Link href="/admin/users" className="text-charcoal/50 hover:text-forest">משתמשים</Link>
              <Link href="/admin/reports" className="text-charcoal/50 hover:text-forest">דיווחים</Link>
              <Link href="/admin/cities" className="text-forest font-medium">ערים ושירותים</Link>
            </nav>
          </div>

          <div className="bg-white rounded-2xl border border-forest/8 p-6 mb-8">
            <h2 className="font-medium mb-4">הוספת נכס ידנית (אושר אוטומטית)</h2>
            <ManualPropertyForm cities={cities ?? []} />
          </div>

          <ReferenceDataManager cities={cities ?? []} amenities={amenities ?? []} categories={categories ?? []} />
        </div>
      </main>
      <Footer />
    </>
  );
}
