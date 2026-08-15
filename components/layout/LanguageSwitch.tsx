'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * The site is Hebrew-only for now (see README "Adding English later").
 * This switch is wired up visually and stores the preference, but full
 * i18n routing is a future stage — flipping it currently just updates
 * the pressed state so the control is ready to connect once English
 * content exists.
 */
export function LanguageSwitch() {
  const [lang, setLang] = useState<'he' | 'en'>('he');

  return (
    <div
      className="flex items-center rounded-full bg-white border border-forest/10 p-1 shadow-sm"
      role="group"
      aria-label="בחירת שפה"
    >
      <button
        type="button"
        onClick={() => setLang('he')}
        aria-pressed={lang === 'he'}
        className={cn(
          'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
          lang === 'he' ? 'bg-forest text-cream' : 'text-charcoal/60'
        )}
      >
        עב
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        title="English support is coming soon"
        className={cn(
          'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
          lang === 'en' ? 'bg-forest text-cream' : 'text-charcoal/60'
        )}
      >
        EN
      </button>
    </div>
  );
}
