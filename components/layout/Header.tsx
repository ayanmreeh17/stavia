import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LanguageSwitch } from './LanguageSwitch';
import { MobileNav } from './MobileNav';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/Button';
import { Heart, LayoutDashboard } from 'lucide-react';

export async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-forest/10">
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-forest tracking-tight">
          Stavia <span className="text-brass">·</span> סטאביה
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-charcoal/80">
          <Link href="/search" className="hover:text-forest transition-colors">חיפוש נכסים</Link>
          <Link href="/destinations" className="hover:text-forest transition-colors">יעדים</Link>
          <Link href="/list-your-property" className="hover:text-forest transition-colors">פרסמו נכס</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitch />
          {user ? (
            <>
              <NotificationBell userId={user.id} />
              <Link href="/account/favorites" className="p-2 text-forest hover:bg-forest/5 rounded-full" aria-label="מועדפים">
                <Heart size={20} />
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard size={16} />
                  האזור שלי
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">התחברות</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">הרשמה</Button>
              </Link>
            </>
          )}
        </div>

        <MobileNav isLoggedIn={!!user} />
      </div>
    </header>
  );
}
