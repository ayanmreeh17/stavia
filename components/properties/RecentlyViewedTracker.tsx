'use client';

import { useEffect } from 'react';

const KEY = 'stavia:recently-viewed';
const MAX_ITEMS = 12;

/**
 * Tracks recently-viewed property ids in-browser only. This is intentionally
 * NOT part of the persistent data model — it's a small UX convenience
 * (like a browser history), not user-generated content, so localStorage is
 * an acceptable, honest use here. Favorites (the "save this for real" action)
 * are stored in Supabase in the `favorites` table instead.
 */
export function RecentlyViewedTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = [propertyId, ...ids.filter((id) => id !== propertyId)].slice(0, MAX_ITEMS);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (e.g. private browsing) — safe to ignore.
    }
  }, [propertyId]);

  return null;
}

export function getRecentlyViewedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
