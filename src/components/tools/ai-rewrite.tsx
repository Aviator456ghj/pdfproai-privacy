'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileEdit, Loader2, FileText, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

type Tone = 'professional' | 'casual' | 'academic' | 'creative';

const tones: { value: Tone; label: string; desc: string; icon: string }[] = [
  { value: 'professional', label: 'Professional', desc: 'Formal & business-ready', icon: '💼' },
  { value: 'casual', label: 'Casual', desc: 'Friendly & conversational', icon: '😊' },
  { value: 'academic', label: 'Academic', desc: 'Scholarly & precise', icon: '🎓' },
  { value: 'creative', label: 'Creative', desc: 'Engaging & expressive', icon: '✨' },
];

const demoRewrites: Record<Tone, string> = {
  professional: 'The implementation of strategic initiatives requires careful consideration of organizational objectives and stakeholder expectations. Our analysis indicates that adopting a phased approach will yield optimal results while minimizing operational disruption.',
  casual: "Here's the thing — if we take it step by step and keep everyone in the loop, we'll get great results without shaking things up too much. It's all about finding that sweet spot between moving fast and being thoughtful.",
  academic: 'The empirical evidence suggests that a methodological, incremental approach to strategy implementation produces superior outcomes. This paradigm aligns with established organizational change theories (Kotter, 1996; Lewin, 1947) and mitigates the risk of systemic disruption.',
  creative: "Imagine transforming your organization not with a jarring leap, but with an elegant dance — each step choreographed, each movement purposeful. That's the magic of phased implementation: it turns chaos into a symphony of progress.",
};

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

export function AiRewrite() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [tone, setTone] = useState<Tone>('professional');
  const [inputText, setInputText] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  const [copied, setCopied] = useState(false);

  const file = uploadedFiles[0];

  const handleRewrite = async () => {
    const textToRewrite = inputText.trim();
    if (!textToRewrite && !file) {
      toast.error('Please upload a PDF or enter text to rewrite');
      return;
    }

    setIsProcessing(true);
    setRewrittenText('');

    try {
      await new Promise((r) => setTimeout(r, 2500));
      setRewrittenText(demoRewrites[tone]);
      toast.success('Text rewritten successfully!');
    } catch {
      toast.error('Failed to rewrite text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!rewrittenText) return;
    try {
      await navigator.clipboard.writeText(rewrittenText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const reset = () => {
    clearUploadedFiles();
    setInputText('');
    setRewrittenText('');
  };

  return (
    <ToolLayout toolId="ai-rewrite">
      <div className="space-y-6">
        <FileUploader accept=".pdf" multiple={false} maxFiles={1} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-rose-500" />
              Text Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type the text you want to rewrite... (or upload a PDF above)"
              rows={5}
              className="resize-y"
            />
            {file && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>Text will be extracted from: {file.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-500" />
              Tone Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={tone}
              onValueChange={(v) => setTone(v as Tone)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {tones.map((t) => (
                <label
                  key={t.value}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all text-center ${
                    tone === t.value
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-border hover:border-rose-300'
                  }`}
                >
                  <RadioGroupItem value={t.value} className="sr-only" />
                  <span className="text-xl">{t.icon}</span>
                  <span className={`text-sm font-medium ${tone === t.value ? 'text-rose-700 dark:text-rose-300' : ''}`}>
                    {t.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Button
          onClick={handleRewrite}
          disabled={isProcessing}
          className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white w-full sm:w-auto"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Rewrite
            </>
          )}
        </Button>

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
                    <p className="font-medium text-foreground">Rewriting in {tones.find((t) => t.value === tone)?.label} tone...</p>
                    <p className="text-sm text-muted-foreground mt-1">AI is crafting your improved text</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {rewrittenText && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-rose-500" />
                    Rewritten Text
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
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={reset}>
                      Start Over
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                  {rewrittenText}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}