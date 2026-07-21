'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { hasReachedDailyLimit, getRemainingTasks, FREE_DAILY_LIMIT } from '@/lib/usage-limit';

/**
 * Hook for tools to interact with the ad system and usage limits.
 * Tools should use this to:
 * 1. Check if user is on free tier
 * 2. Check if daily usage limit is reached
 * 3. Get the correct download URL (with or without watermark)
 * 4. Get fetch options with user tier header
 */
export function useToolAd() {
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const setShowUsageLimitModal = useAppStore((s) => s.setShowUsageLimitModal);
  const processingAdWatched = useAppStore((s) => s.ad.processingAdWatched);
  const isFree = userTier === 'free';

  /**
   * Check if the user can use the tool (hasn't hit daily limit).
   * For premium/business users, always returns true.
   */
  const canUseTool = useCallback((): boolean => {
    if (!isFree) return true;
    return !hasReachedDailyLimit();
  }, [isFree]);

  /**
   * Get remaining tasks for today (for display purposes).
   */
  const remainingTasks = isFree ? getRemainingTasks() : Infinity;

  /**
   * Check if the user should see the usage limit modal.
   * Call this before allowing file upload or action.
   */
  const checkUsageLimit = useCallback((): boolean => {
    if (!isFree) return true; // Premium users always pass
    if (hasReachedDailyLimit()) {
      setShowUsageLimitModal(true);
      return false;
    }
    return true;
  }, [isFree, setShowUsageLimitModal]);

  /**
   * Build fetch options that include the user tier header.
   * If processing ad was watched, pass 'premium' to get clean output.
   * API routes use this to decide whether to watermark.
   */
  const getFetchOptions = useCallback(
    (options: RequestInit = {}): RequestInit => {
      // If user watched the processing ad, treat as premium for this request
      const effectiveTier = (isFree && processingAdWatched) ? 'premium' : userTier;
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-User-Tier': effectiveTier,
        },
      };
    },
    [userTier, isFree, processingAdWatched]
  );

  /**
   * Fetch a PDF from an API route, respecting the user's tier.
   * Free users who watched the processing ad get clean PDFs.
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
    canUseTool,
    remainingTasks,
    dailyLimit: FREE_DAILY_LIMIT,
    checkUsageLimit,
    getFetchOptions,
    fetchPdf,
    processingAdWatched,
  };
}