'use client';

import { Button } from '@/components/ui/Button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-5 text-center">
      <h1 className="text-xl font-display mb-2">משהו השתבש</h1>
      <p className="text-charcoal/60 mb-6">אירעה שגיאה בלתי צפויה. נסו שוב.</p>
      <Button onClick={reset}>ניסיון חוזר</Button>
    </div>
  );
}
