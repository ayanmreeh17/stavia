'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { toggleFavoriteAction } from '@/lib/actions/properties';
import { cn } from '@/lib/utils';

export function FavoriteButton({ propertyId, initialFavorited, isLoggedIn }: {
  propertyId: string; initialFavorited: boolean; isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    startTransition(async () => {
      const result = await toggleFavoriteAction(propertyId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setFavorited(result.data?.favorited ?? !favorited);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label="הוספה למועדפים"
      className="p-3 rounded-full bg-white border border-forest/10 hover:border-brass transition-colors"
    >
      <Heart size={19} className={cn('transition-colors', favorited ? 'fill-red-500 text-red-500' : 'text-charcoal/50')} />
    </button>
  );
}
