'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Clock, Crown, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';

const AD_DURATION = 8;
const SKIP_AFTER = 5;

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
    icon: Sparkles,
    tagline: 'Join 500K+ premium users today',
  },
];

interface ProcessingAdOverlayProps {
  isProcessing: boolean;
  onDismiss: () => void;
}

export function ProcessingAdOverlay({ isProcessing, onDismiss }: ProcessingAdOverlayProps) {
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const setProcessingAdWatched = useAppStore((s) => s.setProcessingAdWatched);

  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);
  const [adComplete, setAdComplete] = useState(false);
  const [processingDone, setProcessingDone] = useState(false);
  const [adIndex] = useState(() => Math.floor(Math.random() * adContent.length));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasDismissedRef = useRef(false);
  const prevProcessingRef = useRef(false);

  const ad = adContent[adIndex];
  const AdIcon = ad.icon;

  // Detect isProcessing transition: false → true (show overlay) or true → false (mark done)
  useEffect(() => {
    if (isProcessing && !prevProcessingRef.current) {
      // Processing just started
      hasDismissedRef.current = false;
      const id = requestAnimationFrame(() => {
        setVisible(true);
        setCountdown(AD_DURATION);
        setCanSkip(false);
        setAdComplete(false);
        setProcessingDone(false);
      });
      return () => cancelAnimationFrame(id);
    }
    if (!isProcessing && prevProcessingRef.current && visible) {
      // Processing just finished
      const id = requestAnimationFrame(() => {
        setProcessingDone(true);
      });
      return () => cancelAnimationFrame(id);
    }
    prevProcessingRef.current = isProcessing;
  }, [isProcessing, visible]);

  // Countdown timer
  useEffect(() => {
    if (!visible || adComplete) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setAdComplete(true);
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
  }, [visible, adComplete]);

  // Auto-dismiss when both ad and processing are complete
  useEffect(() => {
    if (!visible || !adComplete || !processingDone || hasDismissedRef.current) return;

    hasDismissedRef.current = true;
    setProcessingAdWatched(true);
    const timeout = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 600);
    return () => clearTimeout(timeout);
  }, [visible, adComplete, processingDone, onDismiss, setProcessingAdWatched]);

  const handleSkip = useCallback(() => {
    if (canSkip || adComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      setAdComplete(true);
    }
  }, [canSkip, adComplete]);

  const handleUpgrade = useCallback(() => {
    setUserTier('premium');
  }, [setUserTier]);

  const progressValue = ((AD_DURATION - countdown) / AD_DURATION) * 100;

  if (userTier !== 'free') return null;

  const bothComplete = adComplete && processingDone;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`relative bg-gradient-to-br ${ad.gradient} p-8 sm:p-10 text-white min-h-[400px] flex flex-col justify-between`}>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div className="absolute top-6 right-8 w-16 h-16 rounded-xl bg-white/10 rotate-12 pointer-events-none" />

              {/* Top: Labels */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    Sponsored
                  </span>
                  <span className="text-[10px] font-medium bg-white/15 px-2 py-0.5 rounded-full">
                    {bothComplete ? 'Complete!' : 'Processing your file'}
                  </span>
                </div>
              </div>

              {/* Middle: Content */}
              <div className="relative text-center space-y-4 py-4">
                {bothComplete ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Ready to Download!</h3>
                    <p className="text-white/80 text-sm">Your file has been processed successfully.</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Loader2 className="h-5 w-5 animate-spin text-white/80" />
                      <span className="text-sm font-medium text-white/90">
                        {processingDone ? 'Finishing up...' : 'Processing your file...'}
                      </span>
                    </div>

                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-2">
                      <AdIcon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold leading-tight">{ad.headline}</h3>
                    <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto">{ad.subtext}</p>
                    <p className="text-white/50 text-xs italic">{ad.tagline}</p>

                    <button
                      onClick={handleUpgrade}
                      className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors shadow-lg text-sm"
                    >
                      <Crown className="h-4 w-4" />
                      {ad.cta}
                    </button>
                  </>
                )}
              </div>

              {/* Bottom: Timer & Progress */}
              <div className="relative space-y-3">
                {!bothComplete && (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {adComplete ? '✓ Ad complete!' : `${countdown}s remaining`}
                        </span>
                        {!processingDone && (
                          <span className="text-white/80">
                            <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                            Processing...
                          </span>
                        )}
                        {processingDone && !adComplete && (
                          <span className="text-white/80">Waiting for ad...</span>
                        )}
                      </div>
                      <Progress value={progressValue} className="h-1.5 bg-white/20" />
                    </div>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-white/50">
                      <span className={`flex items-center gap-1 ${processingDone ? 'text-emerald-300' : ''}`}>
                        <Loader2 className={`h-3 w-3 ${!processingDone ? 'animate-spin' : ''}`} />
                        {processingDone ? '✓ Processed' : 'Processing'}
                      </span>
                      <span className="text-white/20">|</span>
                      <span className={`flex items-center gap-1 ${adComplete ? 'text-emerald-300' : ''}`}>
                        <Clock className="h-3 w-3" />
                        {adComplete ? '✓ Ad watched' : `Ad: ${countdown}s`}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      {canSkip && !adComplete ? (
                        <Button
                          onClick={handleSkip}
                          variant="ghost"
                          className="text-white/80 hover:text-white hover:bg-white/10 w-full rounded-xl border border-dashed border-white/30"
                          size="lg"
                        >
                          Skip Ad
                          <span className="ml-2 text-[10px] bg-white/15 px-1.5 py-0.5 rounded">
                            FREE
                          </span>
                        </Button>
                      ) : !adComplete ? (
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
                          <span>Please wait...</span>
                        </div>
                      ) : !processingDone ? (
                        <div className="flex items-center justify-center gap-2 text-white/70 text-sm py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Finishing processing...</span>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}

                <p className="text-center text-[10px] text-white/40">
                  Skip all ads & remove watermarks with{' '}
                  <button onClick={handleUpgrade} className="underline hover:text-white/70 transition-colors">
                    PDFPro Premium
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}