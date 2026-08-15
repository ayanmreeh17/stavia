import Link from 'next/link';

const columns = [
  {
    title: 'סטאביה',
    links: [
      { href: '/about', label: 'אודות' },
      { href: '/list-your-property', label: 'פרסמו נכס' },
      { href: '/contact', label: 'צור קשר' },
    ],
  },
  {
    title: 'יעדים',
    links: [
      { href: '/search?region=north', label: 'צפון' },
      { href: '/search?region=center', label: 'מרכז' },
      { href: '/search?region=south', label: 'דרום' },
    ],
  },
  {
    title: 'משפטי',
    links: [
      { href: '/legal/privacy', label: 'מדיניות פרטיות' },
      { href: '/legal/terms', label: 'תנאי שימוש' },
      { href: '/legal/cookies', label: 'מדיניות עוגיות' },
      { href: '/legal/cancellation', label: 'מדיניות ביטולים' },
      { href: '/legal/owner-terms', label: 'תנאים לבעלי נכסים' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-forest-800 text-cream/80 mt-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-2xl text-cream">Stavia</span>
            <p className="mt-3 text-sm leading-relaxed text-cream/60 max-w-xs">
              פלטפורמת נופש בוטיק למציאת וילות, צימרים ובתי נופש ברחבי ישראל.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-cream mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-cream/60 hover:text-brass-light transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="horizon-rule mt-12 mb-6 opacity-40" />
        <p className="text-xs text-cream/40">
          © {new Date().getFullYear()} Stavia · סטאביה. כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
}
