import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { formatPriceILS } from '@/lib/utils';

export const metadata = { title: 'האזור שלי' };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/dashboard');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, status, rejection_reason, cover_image_url, created_at, prices(weekday_price)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-sage-light py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="eyebrow">האזור האישי שלי</span>
              <h1 className="text-2xl md:text-3xl mt-2">הנכסים שלי</h1>
            </div>
            <div className="flex gap-2">
              {profile?.role === 'admin' && (
                <Link href="/admin"><Button variant="outline">ניהול אתר</Button></Link>
              )}
              <Link href="/list-your-property">
                <Button><Plus size={16} /> נכס חדש</Button>
              </Link>
            </div>
          </div>

          {!properties || properties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-forest/20 py-16 px-8 text-center">
              <p className="text-charcoal/60 mb-4">עדיין לא פרסמתם נכסים.</p>
              <Link href="/list-your-property"><Button>פרסום נכס ראשון</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/dashboard/properties/${p.id}/edit`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-forest/8 p-4 hover:shadow-card transition-shadow"
                >
                  <div className="w-20 h-20 rounded-xl bg-sage shrink-0 overflow-hidden">
                    {p.cover_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-charcoal truncate">{p.name}</h3>
                      <StatusBadge status={p.status} />
                    </div>
                    {p.status === 'rejected' || p.status === 'needs_changes' ? (
                      <p className="text-xs text-red-600 mt-1">{p.rejection_reason}</p>
                    ) : (
                      p.prices?.[0]?.weekday_price && (
                        <p className="text-sm text-charcoal/50 mt-1">{formatPriceILS(p.prices[0].weekday_price)} / לילה</p>
                      )
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
