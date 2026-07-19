'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

const BENEFITS = [
  'No watermarks on any output',
  'Unlimited file processing',
  'All 100+ tools unlocked',
];

interface SectionAdBannerProps {
  variant?: 'compact' | 'full';
}

export function SectionAdBanner({ variant = 'compact' }: SectionAdBannerProps) {
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const [dismissed, setDismissed] = useState(false);

  // Premium users never see the banner
  if (userTier !== 'free') {
    return null;
  }

  if (dismissed) {
    return null;
  }

  const handleUpgrade = () => {
    setUserTier('premium');
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (variant === 'compact') {
    return (
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
              {/* Subtle gradient accent line on top */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-400" />

              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
                {/* Left: icon + text */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 truncate">
                    Go Premium — Remove all watermarks &amp; ads
                  </p>
                </div>

                {/* Right: CTA + dismiss */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={handleUpgrade}
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm gap-1.5"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade Now
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-emerald-600/50 hover:text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400/50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full variant
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12, height: 0, overflow: 'hidden' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
            {/* Gradient accent border on the left */}
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-2xl" />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 pl-6 sm:pl-7">
              {/* Left side: icon + text + benefits */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Free users see ads &amp; watermarks
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Upgrade for a clean, unlimited experience
                    </p>
                  </div>
                </div>

                <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pl-[52px]">
                  {BENEFITS.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right side: CTA + dismiss */}
              <div className="flex items-center gap-3 sm:shrink-0 pl-[52px] sm:pl-0">
                <Button
                  onClick={handleUpgrade}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm gap-2"
                  size="lg"
                >
                  <Crown className="h-4 w-4" />
                  Get Premium
                </Button>
                <button
                  onClick={handleDismiss}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}