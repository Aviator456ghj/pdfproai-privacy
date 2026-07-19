'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, SkipForward, Crown, Shield, Zap, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';

const AD_DURATION = 8; // seconds
const SKIP_AFTER = 5; // can skip after 5 seconds

// Fake ad content pool - realistic looking ads
const adContent = [
  {
    headline: 'Upgrade to PDFPro Premium',
    subtext: 'Remove all watermarks • Unlimited processing • Priority support',
    cta: 'Get Premium — $9.99/mo',
    gradient: 'from-emerald-500 to-teal-600',
    icon: Crown,
    tagline: 'Trusted by 2M+ professionals worldwide',
  },
  {
    headline: 'PDFPro Business Plan',
    subtext: 'API access • Team collaboration • Custom branding • 500 GB storage',
    cta: 'Try Business Free for 14 Days',
    gradient: 'from-violet-500 to-purple-600',
    icon: Zap,
    tagline: 'Powering enterprise document workflows',
  },
  {
    headline: 'Go Ad-Free Forever',
    subtext: 'No more waiting • Clean downloads • All 100+ tools unlocked',
    cta: 'Start Free Trial',
    gradient: 'from-amber-500 to-orange-500',
    icon: Shield,
    tagline: 'Join 500K+ premium users today',
  },
];

interface AdModalProps {
  type: 'pre' | 'post';
  onComplete: () => void;
  onClose?: () => void;
}

export function AdModal({ type, onComplete, onClose }: AdModalProps) {
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [adIndex] = useState(Math.floor(Math.random() * adContent.length));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ad = adContent[adIndex];
  const AdIcon = ad.icon;

  // Countdown timer
  useEffect(() => {
    if (isComplete) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsComplete(true);
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
  }, [isComplete]);

  const handleSkip = useCallback(() => {
    if (canSkip || isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      onComplete();
    }
  }, [canSkip, isComplete, onComplete]);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  const progressValue = ((AD_DURATION - countdown) / AD_DURATION) * 100;

  // Premium users should never see this
  if (userTier !== 'free') {
    onComplete();
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={type === 'post' ? handleClose : undefined}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button — only for post-ad, and only after countdown */}
          {type === 'post' && isComplete && (
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Type indicator */}
          {type === 'pre' && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Eye className="h-3 w-3 text-white/70" />
              <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                Watch to continue
              </span>
            </div>
          )}

          {/* Ad Content Area */}
          <div className={`relative bg-gradient-to-br ${ad.gradient} p-8 sm:p-10 text-white min-h-[340px] flex flex-col justify-between`}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute top-6 right-8 w-16 h-16 rounded-xl bg-white/10 rotate-12 pointer-events-none" />

            {/* Top: Sponsored label */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Sponsored
                </span>
                {type === 'pre' && (
                  <span className="text-[10px] font-medium bg-white/15 px-2 py-0.5 rounded-full">
                    Required to use this tool
                  </span>
                )}
                {type === 'post' && (
                  <span className="text-[10px] font-medium bg-white/15 px-2 py-0.5 rounded-full">
                    Remove watermark option
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Ad content */}
            <div className="relative text-center space-y-4 py-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-2">
                <AdIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight">{ad.headline}</h3>
              <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto">{ad.subtext}</p>
              <p className="text-white/50 text-xs italic">{ad.tagline}</p>

              {/* CTA Button — upgrade */}
              <button
                onClick={() => {
                  setUserTier('premium');
                  onComplete();
                }}
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg text-sm"
              >
                <Crown className="h-4 w-4" />
                {ad.cta}
              </button>
            </div>

            {/* Bottom: Timer & Skip */}
            <div className="relative space-y-3">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isComplete ? '✓ Ad complete!' : `${countdown}s remaining`}
                  </span>
                  {!isComplete && countdown <= SKIP_AFTER && (
                    <span className="text-white/80">Skip available soon...</span>
                  )}
                </div>
                <Progress
                  value={progressValue}
                  className="h-1.5 bg-white/20"
                />
              </div>

              {/* Skip / Continue button */}
              <div className="flex justify-center">
                {isComplete ? (
                  <Button
                    onClick={handleSkip}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 w-full rounded-xl"
                    size="lg"
                  >
                    {type === 'pre' ? (
                      <>
                        Continue to Tool
                        <SkipForward className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Continue with Watermark
                        <Download className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : canSkip ? (
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10 w-full rounded-xl border border-dashed border-white/30"
                    size="lg"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip Ad
                    <span className="ml-2 text-[10px] bg-white/15 px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-white/50 text-sm py-2">
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
                    <span>Ad playing... Skip in {countdown}s</span>
                  </div>
                )}
              </div>

              {/* Tiny upgrade hint */}
              <p className="text-center text-[10px] text-white/40">
                Skip all ads & remove watermarks with{' '}
                <button
                  onClick={() => {
                    setUserTier('premium');
                    onComplete();
                  }}
                  className="underline hover:text-white/70 transition-colors"
                >
                  PDFPro Premium
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}