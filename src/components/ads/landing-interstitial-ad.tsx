'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Crown, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

const SHOW_DELAY = 3000; // 3 seconds after page load
const AD_DURATION = 6; // seconds total
const SKIP_AFTER = 4; // can skip after 4 seconds

const BENEFITS = [
  'No watermarks',
  'Unlimited processing',
  'Priority support',
  'All 100+ tools',
];

interface LandingInterstitialAdProps {
  onDismiss?: () => void;
}

export function LandingInterstitialAd({ onDismiss }: LandingInterstitialAdProps) {
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissedRef = useRef(false);

  // Show ad after delay (also checks session eligibility)
  useEffect(() => {
    // Premium users or already shown this session — skip
    if (userTier !== 'free') return;
    if (sessionStorage.getItem('landing-interstitial-shown') === 'true') return;

    const delayTimer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem('landing-interstitial-shown', 'true');
    }, SHOW_DELAY);

    return () => clearTimeout(delayTimer);
  }, [userTier]);

  // Countdown timer — starts when ad becomes visible
  useEffect(() => {
    if (!visible) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        if (prev === SKIP_AFTER + 1) {
          setCanSkip(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  const handleUpgrade = useCallback(() => {
    setUserTier('premium');
    handleDismiss();
  }, [setUserTier, handleDismiss]);

  const progressValue = ((AD_DURATION - countdown) / AD_DURATION) * 100;

  // Premium users never see the interstitial
  if (userTier !== 'free') {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {canSkip && (
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-8 sm:p-10 text-white">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div className="absolute top-8 right-6 w-12 h-12 rounded-xl bg-white/10 rotate-12 pointer-events-none" />

              {/* Sponsored badge */}
              <div className="relative mb-6">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Sponsored
                </span>
              </div>

              {/* Headline */}
              <div className="relative text-center space-y-5">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-1">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  Unlock PDFPro Premium Today
                </h2>

                {/* Benefits list */}
                <ul className="space-y-2.5 text-sm text-white/90 max-w-xs mx-auto">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-white/70 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Button
                  onClick={handleUpgrade}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg text-sm mt-2"
                  size="lg"
                >
                  <Crown className="h-4 w-4" />
                  Get Premium — $9.99/mo
                </Button>

                {/* Timer progress */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {countdown > 0 ? `${countdown}s remaining` : '✓ Ready to continue'}
                    </span>
                    {!canSkip && countdown > 0 && (
                      <span className="text-white/60">
                        Skip in {countdown > SKIP_AFTER ? SKIP_AFTER : countdown}s
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-white/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressValue}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Continue with Free — appears after countdown */}
                {canSkip && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      className="w-full text-white/80 hover:text-white hover:bg-white/10 rounded-xl border border-dashed border-white/30"
                      size="lg"
                    >
                      Continue with Free
                    </Button>
                    <button
                      onClick={handleDismiss}
                      className="block mx-auto text-[11px] text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
                    >
                      No thanks, continue free
                    </button>
                  </motion.div>
                )}

                {/* Loading dots while waiting */}
                {!canSkip && countdown > 0 && (
                  <div className="flex items-center justify-center gap-2 text-white/40 text-sm pt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-white/40"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                        />
                      ))}
                    </div>
                    <span>Please wait...</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}