import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReportRow } from '@/components/admin/ReportRow';
import Link from 'next/link';

export const metadata = { title: 'תוכן מדווח' };

export default async function AdminReportsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin/reports');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data: reports } = await supabase
    .from('reports')
    .select('id, reason, details, status, created_at, property_id, review_id, properties(name), reviews(comment)')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-sage-light py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="eyebrow">ניהול אתר</span>
              <h1 className="text-2xl md:text-3xl mt-2">תוכן מדווח</h1>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link href="/admin/properties" className="text-charcoal/50 hover:text-forest">נכסים</Link>
              <Link href="/admin/users" className="text-charcoal/50 hover:text-forest">משתמשים</Link>
              <Link href="/admin/reports" className="text-forest font-medium">דיווחים</Link>
              <Link href="/admin/cities" className="text-charcoal/50 hover:text-forest">ערים ושירותים</Link>
            </nav>
          </div>

          {!reports || reports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-forest/20 py-16 text-center text-charcoal/50">
              אין דיווחים פתוחים כרגע
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r: any) => <ReportRow key={r.id} report={r} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
