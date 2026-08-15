import Link from 'next/link';
import { ShieldCheck, TrendingUp, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const points = [
  { icon: ShieldCheck, title: 'תהליך אישור מוקפד', text: 'כל נכס עובר בדיקה ידנית לפני שהוא מתפרסם — כדי לשמור על רמה גבוהה בכל האתר.' },
  { icon: Users2, title: 'חשיפה לקהל איכותי', text: 'נופשים שמחפשים חוויה בוטיקית, לא עוד דירת נופש גנרית.' },
  { icon: TrendingUp, title: 'ניהול פשוט', text: 'דשבורד ייעודי לניהול נכסים, חדרים, תמונות ומחירים במקום אחד.' },
];

export function OwnerCTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="eyebrow">לבעלי נכסים</span>
          <h2 className="mt-2 text-2xl md:text-3xl leading-snug">
            יש לכם נכס נופש? <br /> הצטרפו לסטאביה
          </h2>
          <p className="mt-4 text-charcoal/60 max-w-md">
            פרסום נכס בסטאביה הוא פשוט ומהיר — מלאו פרטים, הוסיפו תמונות, והמתינו לאישור הצוות שלנו.
          </p>
          <Link href="/list-your-property">
            <Button size="lg" className="mt-6">פרסמו את הנכס שלכם</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {points.map((p) => (
            <div key={p.title} className="flex gap-4 bg-white rounded-2xl border border-forest/8 p-5">
              <p.icon size={22} className="text-brass shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-charcoal">{p.title}</h3>
                <p className="text-sm text-charcoal/60 mt-1">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
