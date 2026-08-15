'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LanguageSwitch } from './LanguageSwitch';

interface MobileNavProps {
  isLoggedIn: boolean;
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="פתח תפריט"
        className="p-2 text-forest"
      >
        <Menu size={26} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-forest/10">
            <span className="font-display text-xl text-forest">Stavia</span>
            <button onClick={() => setOpen(false)} aria-label="סגור תפריט" className="p-2 text-forest">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-5 py-6 text-lg font-medium text-charcoal">
            <Link href="/search" onClick={() => setOpen(false)} className="py-3 border-b border-charcoal/5">חיפוש נכסים</Link>
            <Link href="/destinations" onClick={() => setOpen(false)} className="py-3 border-b border-charcoal/5">יעדים פופולריים</Link>
            <Link href="/list-your-property" onClick={() => setOpen(false)} className="py-3 border-b border-charcoal/5">פרסמו נכס</Link>
            {isLoggedIn ? (
              <>
                <Link href="/account/favorites" onClick={() => setOpen(false)} className="py-3 border-b border-charcoal/5">המועדפים שלי</Link>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="py-3 border-b border-charcoal/5">אזור אישי</Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="py-3 border-b border-charcoal/5">התחברות</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="py-3 border-b border-charcoal/5">הרשמה</Link>
              </>
            )}
          </nav>

          <div className="px-5 py-4 mt-auto border-t border-forest/10 bg-white">
            <LanguageSwitch />
          </div>
        </div>
      )}
    </div>
  );
}
