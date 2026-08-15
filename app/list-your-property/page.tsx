import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertyWizard } from '@/components/wizard/PropertyWizard';

export const metadata = { title: 'פרסמו נכס' };

export default async function ListYourPropertyPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/list-your-property');

  const [{ data: categories }, { data: cities }, { data: amenities }] = await Promise.all([
    supabase.from('categories').select('id, key, name_he').eq('is_active', true).order('sort_order'),
    supabase.from('cities').select('id, name_he, region').eq('is_active', true).order('name_he'),
    supabase.from('amenities').select('id, key, name_he, group').eq('is_active', true).order('sort_order'),
  ]);

  return (
    <>
      <Header />
      <main className="bg-sage-light min-h-screen py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <span className="eyebrow">בעלי נכסים</span>
          <h1 className="text-2xl md:text-3xl mt-2 mb-8">פרסום נכס חדש</h1>
          <PropertyWizard
            categories={categories ?? []}
            cities={cities ?? []}
            amenities={amenities ?? []}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
