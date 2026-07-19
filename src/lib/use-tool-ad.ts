'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/lib/store';

/**
 * Hook for tools to interact with the ad system.
 * Tools should use this to:
 * 1. Check if user is on free tier
 * 2. Get the correct download URL (with or without watermark)
 * 3. Trigger post-tool ad for watermark removal
 */
export function useToolAd() {
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const isFree = userTier === 'free';

  /**
   * Build fetch options that include the user tier header.
   * API routes use this to decide whether to watermark.
   */
  const getFetchOptions = useCallback(
    (options: RequestInit = {}): RequestInit => {
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-User-Tier': userTier,
        },
      };
    },
    [userTier]
  );

  /**
   * Fetch a PDF from an API route, respecting the user's tier.
   * Free users get watermarked PDFs unless they've watched an ad.
   */
  const fetchPdf = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const response = await fetch(url, getFetchOptions(options));
      return response;
    },
    [getFetchOptions]
  );

  return {
    isFree,
    userTier,
    setUserTier,
    getFetchOptions,
    fetchPdf,
  };
}