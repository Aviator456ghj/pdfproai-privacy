'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Clock, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { getRemainingTasks, getTimeUntilReset, formatResetCountdown, FREE_DAILY_LIMIT } from '@/lib/usage-limit';

interface UsageLimitModalProps {
  open: boolean;
  onClose: () => void;
}

export function UsageLimitModal({ open, onClose }: UsageLimitModalProps) {
  const setUserTier = useAppStore((s) => s.setUserTier);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!open) return;

    const updateCountdown = () => {
      setCountdown(formatResetCountdown(getTimeUntilReset()));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [open]);

  const handleUpgrade = () => {
    setUserTier('premium');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <Card className="overflow-hidden shadow-2xl border-0">
              {/* Header */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-8 text-center text-white">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 mb-4">
                  <Lock className="h-7 w-7 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold">Daily Limit Reached</h2>
                <p className="text-sm text-slate-300 mt-2">
                  You&apos;ve used all {FREE_DAILY_LIMIT} free tasks for today.
                </p>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Info section */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tasks used today</span>
                    <span className="text-sm font-semibold">{FREE_DAILY_LIMIT} / {FREE_DAILY_LIMIT}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 w-full" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Resets in
                    </span>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {countdown}
                    </span>
                  </div>
                </div>

                {/* What you get with Premium */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    With Premium, you get:
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Unlimited daily tasks — no limits',
                      'No watermarks on any download',
                      'No ads — instant processing',
                      'All 100+ tools unlocked',
                      'Priority support',
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="space-y-2.5 pt-1">
                  <Button
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-sm"
                    size="lg"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium — $9.99/mo
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Wait and come back later
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground text-center">
                  30-day money-back guarantee • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}