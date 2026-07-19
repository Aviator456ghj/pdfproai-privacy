'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Loader2, FileText, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const demoKeyPoints = [
  'The global digital transformation market is projected to reach $3.9 trillion by 2027, driven by cloud computing adoption and AI integration across industries.',
  'Organizations that adopt a phased implementation strategy see 40% higher success rates compared to big-bang approaches, according to McKinsey research.',
  'Cybersecurity remains the top concern for 62% of enterprises, with zero-trust architecture emerging as the preferred security framework.',
  'Employee training and change management are critical success factors — companies investing in upskilling see 3x faster adoption rates.',
  'ROI from digital transformation initiatives typically materializes within 18-24 months, with an average return of 15-25% on investment.',
  'Hybrid cloud environments are now the dominant infrastructure model, used by 82% of enterprises for their flexibility and cost optimization.',
];

function SparkleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-rose-400 rounded-full"
          initial={{
            x: `${50 + (Math.random() - 0.5) * 60}%`,
            y: '100%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: '-10%',
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function AiKeyPoints() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const file = uploadedFiles[0];

  const handleExtract = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setKeyPoints([]);

    try {
      await new Promise((r) => setTimeout(r, 2500));
      setKeyPoints(demoKeyPoints);
      toast.success(`${demoKeyPoints.length} key points extracted!`);
    } catch {
      toast.error('Failed to extract key points. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!keyPoints.length) return;
    const text = keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const reset = () => {
    clearUploadedFiles();
    setKeyPoints([]);
  };

  return (
    <ToolLayout toolId="ai-key-points">
      <div className="space-y-6">
        {!file ? (
          <FileUploader accept=".pdf" multiple={false} maxFiles={1} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change
                </Button>
              </div>
            </Card>

            {!keyPoints.length && (
              <Button
                onClick={handleExtract}
                disabled={isProcessing}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white w-full sm:w-auto"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting Key Points...
                  </>
                ) : (
                  <>
                    <FileSearch className="mr-2 h-4 w-4" />
                    Extract Key Points
                  </>
                )}
              </Button>
            )}

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="relative overflow-hidden p-8">
                    <SparkleEffect />
                    <div className="flex flex-col items-center gap-4 relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="h-10 w-10 text-rose-500" />
                      </motion.div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">Analyzing document...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          AI is identifying the most important points
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {keyPoints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileSearch className="h-4 w-4 text-rose-500" />
                        Key Points ({keyPoints.length})
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          {copied ? (
                            <>
                              <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1.5 h-3.5 w-3.5" />
                              Copy All
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={reset}>
                          Start Over
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {keyPoints.map((point, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex gap-3 p-3 rounded-lg border bg-muted/20"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm leading-relaxed pt-0.5">{point}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}