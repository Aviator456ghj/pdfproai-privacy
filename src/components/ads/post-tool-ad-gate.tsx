'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Crown,
  Eye,
  Download,
  Sparkles,
  Droplets,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { AdModal } from './ad-modal';
import { incrementDailyUsage } from '@/lib/usage-limit';

interface PostToolAdGateProps {
  children: React.ReactNode;
  onDownloadWithoutWatermark?: () => void;
  onDownloadWithWatermark?: () => void;
  hasOutput: boolean;
  fileName?: string;
}

export function PostToolAdGate({
  children,
  onDownloadWithoutWatermark,
  onDownloadWithWatermark,
  hasOutput,
  fileName = 'output.pdf',
}: PostToolAdGateProps) {
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const processingAdWatched = useAppStore((s) => s.ad.processingAdWatched);
  const [showPostAd, setShowPostAd] = useState(false);
  const [postAdRemoved, setPostAdRemoved] = useState(false);

  const isFree = userTier === 'free';
  const watermarkRemoved = postAdRemoved || processingAdWatched;

  // Track daily usage when output first appears (free tier)
  const usageTrackedRef = useRef(false);
  useEffect(() => {
    if (hasOutput && isFree && !usageTrackedRef.current) {
      usageTrackedRef.current = true;
      try { incrementDailyUsage(); } catch { /* SSR */ }
    }
  }, [hasOutput, isFree]);

  // Auto-trigger clean download when processing ad was watched and output becomes ready
  const autoDownloadRef = useRef(false);
  useEffect(() => {
    if (hasOutput && isFree && processingAdWatched && !autoDownloadRef.current) {
      autoDownloadRef.current = true;
      const id = requestAnimationFrame(() => {
        onDownloadWithoutWatermark?.();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [hasOutput, isFree, processingAdWatched, onDownloadWithoutWatermark]);

  // Reset tracking when output goes away
  useEffect(() => {
    if (!hasOutput) {
      usageTrackedRef.current = false;
      autoDownloadRef.current = false;
      // Use rAF to avoid synchronous setState in effect
      const id = requestAnimationFrame(() => {
        setPostAdRemoved(false);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [hasOutput]);

  const handleDownloadClean = () => {
    if (watermarkRemoved) {
      onDownloadWithoutWatermark?.();
    } else if (isFree) {
      setShowPostAd(true);
    } else {
      onDownloadWithoutWatermark?.();
    }
  };

  const handleAdComplete = () => {
    setShowPostAd(false);
    setPostAdRemoved(true);
    onDownloadWithoutWatermark?.();
  };

  // For free users who watched the ad, show clean success banner
  if (hasOutput && isFree && watermarkRemoved) {
    return (
      <>
        {children}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-semibold">Ready to Download</span>
              </div>
              <Badge className="bg-white/20 text-white border-0 text-[10px] hover:bg-white/30 cursor-default">
                AD WATCHED ✓
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownloadClean}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                  size="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setUserTier('premium')}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  size="default"
                >
                  <Crown className="mr-1.5 h-4 w-4 text-amber-500" />
                  Go Ad-Free
                </Button>
              </div>
              {fileName && (
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Output file: <span className="font-mono">{fileName}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {children}

      {/* Free tier watermark notice banner */}
      <AnimatePresence>
        {hasOutput && isFree && !watermarkRemoved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Droplets className="h-4 w-4" />
                  <span className="text-sm font-semibold">Free Version — Watermark Applied</span>
                </div>
                <Badge className="bg-white/20 text-white border-0 text-[10px] hover:bg-white/30 cursor-default">
                  FREE TIER
                </Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="text-sm text-foreground font-medium">
                      Your download includes a &quot;PDFPro AI Free&quot; watermark
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Free users receive watermarked outputs. Watch a short ad to remove the watermark, or{' '}
                      <button
                        onClick={() => setUserTier('premium')}
                        className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        upgrade to Premium <Crown className="h-3 w-3" />
                      </button>{' '}
                      for watermark-free downloads.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    onClick={handleDownloadClean}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                    size="default"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Watch Ad to Remove Watermark
                    <Eye className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadWatermarked}
                    className="flex-1 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    size="default"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download with Watermark
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setUserTier('premium')}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                    size="default"
                  >
                    <Crown className="mr-1.5 h-4 w-4 text-amber-500" />
                    Upgrade
                  </Button>
                </div>

                {fileName && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    Output file: <span className="font-mono">{fileName}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-tool ad modal */}
      <AnimatePresence>
        {showPostAd && (
          <AdModal
            type="post"
            onComplete={handleAdComplete}
            onClose={() => setShowPostAd(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}