'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

const SCROLL_THRESHOLD = 600;

export function StickyAdBar() {
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > SCROLL_THRESHOLD) {
      setDismissed(false);
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  // Premium users never see the bar
  if (userTier !== 'free') {
    return null;
  }

  const handleUpgrade = () => {
    setUserTier('premium');
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-40"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="mx-auto max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/20">
              {/* Subtle top glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
                {/* Left: icon + text */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-white truncate">
                    <span className="hidden sm:inline">Upgrade to Premium — </span>
                    <span className="sm:hidden">Go Premium — </span>
                    Remove watermarks &amp; ads
                  </p>
                </div>

                {/* Right: CTA + dismiss */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={handleUpgrade}
                    size="sm"
                    className="bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-sm gap-1.5"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}