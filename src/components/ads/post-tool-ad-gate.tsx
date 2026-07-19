'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Crown,
  Eye,
  Download,
  X,
  Sparkles,
  Droplets,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { AdModal } from './ad-modal';

interface PostToolAdGateProps {
  children: React.ReactNode;
  /** Called to trigger the tool's download with watermark removed */
  onDownloadWithoutWatermark?: () => void;
  /** Called to trigger the tool's normal download (with watermark for free) */
  onDownloadWithWatermark?: () => void;
  /** Whether the tool has produced output ready for download */
  hasOutput: boolean;
  /** Optional: override the download filename for display */
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
  const [showPostAd, setShowPostAd] = useState(false);
  const [watermarkRemoved, setWatermarkRemoved] = useState(false);

  const isFree = userTier === 'free';

  const handleDownloadClean = () => {
    // Free user: show ad first, then download without watermark
    if (isFree && !watermarkRemoved) {
      setShowPostAd(true);
    } else {
      onDownloadWithoutWatermark?.();
    }
  };

  const handleAdComplete = () => {
    setShowPostAd(false);
    setWatermarkRemoved(true);
    // After watching ad, download without watermark
    onDownloadWithoutWatermark?.();
  };

  const handleDownloadWatermarked = () => {
    onDownloadWithWatermark?.();
  };

  return (
    <>
      {children}

      {/* Free tier watermark notice banner — shown after output is ready */}
      <AnimatePresence>
        {hasOutput && isFree && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden">
              {/* Watermark warning banner */}
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
                      Free users receive watermarked outputs. Watch a short ad to remove the watermark from this download, or{' '}
                      <button
                        onClick={() => setUserTier('premium')}
                        className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        upgrade to Premium <Crown className="h-3 w-3" />
                      </button>{' '}
                      for watermark-free downloads forever.
                    </p>
                  </div>
                </div>

                {/* Download buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {/* Primary: Watch ad to remove watermark */}
                  <Button
                    onClick={handleDownloadClean}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                    size="default"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {watermarkRemoved ? (
                      <>
                        Download (No Watermark)
                        <Download className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Watch Ad to Remove Watermark
                        <Eye className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Secondary: Download with watermark */}
                  <Button
                    variant="outline"
                    onClick={handleDownloadWatermarked}
                    className="flex-1 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    size="default"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download with Watermark
                  </Button>

                  {/* Upgrade */}
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