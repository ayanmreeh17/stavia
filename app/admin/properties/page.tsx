import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminPropertyRow } from '@/components/admin/AdminPropertyRow';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const metadata = { title: 'ניהול נכסים' };

const STATUSES = [
  { key: 'pending', label: 'ממתינים לאישור' },
  { key: 'approved', label: 'מאושרים' },
  { key: 'rejected', label: 'נדחו' },
  { key: 'needs_changes', label: 'נדרשים שינויים' },
  { key: 'suspended', label: 'מושהים' },
  { key: 'all', label: 'הכל' },
];

export default async function AdminPropertiesPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin/properties');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const status = searchParams.status ?? 'pending';
  let query = supabase
    .from('properties')
    .select('id, name, status, is_featured, created_at, owner_id, cities(name_he), profiles(email, full_name)');

  if (status !== 'all') query = query.eq('status', status);
  const { data: properties } = await query.order('created_at', { ascending: false });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-sage-light py-10 md:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="eyebrow">ניהול אתר</span>
              <h1 className="text-2xl md:text-3xl mt-2">נכסים</h1>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link href="/admin/properties" className="text-forest font-medium">נכסים</Link>
              <Link href="/admin/users" className="text-charcoal/50 hover:text-forest">משתמשים</Link>
              <Link href="/admin/reports" className="text-charcoal/50 hover:text-forest">דיווחים</Link>
              <Link href="/admin/cities" className="text-charcoal/50 hover:text-forest">ערים ושירותים</Link>
            </nav>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {STATUSES.map((s) => (
              <Link
                key={s.key}
                href={`/admin/properties?status=${s.key}`}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors',
                  status === s.key ? 'bg-forest text-cream border-forest' : 'bg-white text-charcoal/60 border-forest/10'
                )}
              >
                {s.label}
              </Link>
            ))}
          </div>

          {!properties || properties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-forest/20 py-16 text-center text-charcoal/50">
              אין נכסים בסטטוס זה
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((p: any) => <AdminPropertyRow key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
