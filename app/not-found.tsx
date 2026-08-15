import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sage-light flex flex-col items-center justify-center px-5 text-center">
      <span className="font-display text-6xl text-forest">404</span>
      <h1 className="text-xl mt-4 mb-2">הדף לא נמצא</h1>
      <p className="text-charcoal/60 mb-6 max-w-sm">
        ייתכן שהנכס הוסר, שהקישור שגוי, או שהדף שחיפשתם אינו קיים.
      </p>
      <Link href="/"><Button>חזרה לדף הבית</Button></Link>
    </div>
  );
}
