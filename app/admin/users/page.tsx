import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UserRoleRow } from '@/components/admin/UserRoleRow';
import Link from 'next/link';

export const metadata = { title: 'ניהול משתמשים' };

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin/users');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-sage-light py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="eyebrow">ניהול אתר</span>
              <h1 className="text-2xl md:text-3xl mt-2">משתמשים</h1>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link href="/admin/properties" className="text-charcoal/50 hover:text-forest">נכסים</Link>
              <Link href="/admin/users" className="text-forest font-medium">משתמשים</Link>
              <Link href="/admin/reports" className="text-charcoal/50 hover:text-forest">דיווחים</Link>
              <Link href="/admin/cities" className="text-charcoal/50 hover:text-forest">ערים ושירותים</Link>
            </nav>
          </div>

          <div className="bg-white rounded-2xl border border-forest/8 divide-y divide-forest/5">
            {(users ?? []).map((u) => (
              <UserRoleRow key={u.id} user={u} currentUserId={user.id} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
