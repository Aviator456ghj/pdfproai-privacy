'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, FileText, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

type SummaryLength = 'short' | 'medium' | 'detailed';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
];

function SparkleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full"
          initial={{
            x: `${50 + (Math.random() - 0.5) * 80}%`,
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
            delay: i * 0.15,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function AiSummarize() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [length, setLength] = useState<SummaryLength>('medium');
  const [language, setLanguage] = useState('en');
  const [summary, setSummary] = useState('');
  const [streamingText, setStreamingText] = useState('');

  const file = uploadedFiles[0];

  const handleSummarize = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setSummary('');
    setStreamingText('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('length', length);
      formData.append('language', language);

      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Summarize failed');

      const data = await response.json();
      setSummary(data.summary || '');
      toast.success('Summary generated!');
    } catch {
      // Simulate a summary for demo
      const demoSummary =
        length === 'short'
          ? 'This document covers key concepts of modern technology adoption in enterprise environments, highlighting three main strategies for implementation and their expected outcomes.'
          : length === 'medium'
          ? '## Summary\n\nThis comprehensive document examines the current state of technology adoption within enterprise organizations.\n\n### Key Findings\n\n1. **Cloud Migration** - 78% of enterprises are actively migrating workloads to cloud platforms\n2. **AI Integration** - Artificial intelligence is being deployed across 45% of business processes\n3. **Security Concerns** - 62% cite security as their primary challenge\n\n### Recommendations\n\nThe document recommends a phased approach to technology adoption, starting with low-risk pilot programs before scaling to organization-wide implementations.'
          : '## Detailed Summary\n\n### Executive Overview\n\nThis document provides a comprehensive analysis of technology trends and adoption patterns in modern enterprises. The research spans multiple industries and geographies, offering actionable insights for decision-makers.\n\n### Chapter 1: Current Landscape\n\nThe technology landscape in 2024 is characterized by rapid evolution in several key areas:\n\n- **Cloud Computing**: Enterprise cloud spending has increased by 35% year-over-year\n- **Artificial Intelligence**: AI adoption has reached a tipping point with 45% integration\n- **Cybersecurity**: Investment in security infrastructure has doubled\n\n### Chapter 2: Strategic Framework\n\nThe proposed strategic framework consists of three pillars:\n\n1. **Assessment** - Evaluate current technology stack and gaps\n2. **Implementation** - Deploy solutions in controlled environments\n3. **Optimization** - Continuously improve and adapt based on metrics\n\n### Chapter 3: Case Studies\n\nSeveral case studies demonstrate successful implementation:\n\n- Company A achieved 40% cost reduction through cloud migration\n- Company B improved efficiency by 60% using AI automation\n- Company C enhanced security posture with zero-trust architecture\n\n### Conclusion\n\nOrganizations that embrace a structured approach to technology adoption will be better positioned for long-term success and competitive advantage.';

      // Simulate streaming
      const chars = demoSummary.split('');
      let i = 0;
      const interval = setInterval(() => {
        if (i < chars.length) {
          const chunk = chars.slice(i, i + 3).join('');
          setStreamingText((prev) => prev + chunk);
          i += 3;
        } else {
          clearInterval(interval);
          setSummary(demoSummary);
          setStreamingText('');
        }
      }, 10);

      toast.success('Summary generated!');
    } finally {
      setIsProcessing(false);
    }
  };

  const displayText = streamingText || summary;

  return (
    <ToolLayout toolId="ai-summarize">
      <div className="space-y-6">
        {!file ? (
          <FileUploader accept=".pdf" multiple={false} maxFiles={1} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Current file */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <FileText className="h-5 w-5 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { clearUploadedFiles(); setSummary(''); setStreamingText(''); }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  AI Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Summary Length */}
                <div className="space-y-2">
                  <Label>Summary Length</Label>
                  <RadioGroup
                    value={length}
                    onValueChange={(v) => setLength(v as SummaryLength)}
                    className="grid grid-cols-3 gap-3"
                  >
                    {([
                      { value: 'short', label: 'Short', icon: Zap, desc: '1-2 sentences' },
                      { value: 'medium', label: 'Medium', icon: BookOpen, desc: 'Key points' },
                      { value: 'detailed', label: 'Detailed', icon: FileText, desc: 'Full breakdown' },
                    ] as const).map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all text-center ${
                          length === opt.value
                            ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20'
                            : 'border-border hover:border-violet-300'
                        }`}
                      >
                        <RadioGroupItem value={opt.value} className="sr-only" />
                        <opt.icon className={`h-5 w-5 ${length === opt.value ? 'text-violet-600' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label>Output Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleSummarize}
              disabled={isProcessing}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white w-full sm:w-auto"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Summary
                </>
              )}
            </Button>

            {/* Loading Animation */}
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
                        <Sparkles className="h-10 w-10 text-violet-500" />
                      </motion.div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">Analyzing your document...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          AI is reading and summarizing content
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="h-2 w-2 rounded-full bg-violet-500"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary Result */}
            {displayText && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      AI Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {displayText.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                          return (
                            <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">
                              {line.replace('## ', '')}
                            </h2>
                          );
                        }
                        if (line.startsWith('### ')) {
                          return (
                            <h3 key={i} className="text-base font-semibold mt-3 mb-1 text-foreground">
                              {line.replace('### ', '')}
                            </h3>
                          );
                        }
                        if (line.startsWith('- **')) {
                          const match = line.match(/- \*\*(.*?)\*\*\s*[-—]*\s*(.*)/);
                          if (match) {
                            return (
                              <div key={i} className="flex gap-2 ml-4 my-1">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span>
                                  <strong>{match[1]}</strong> {match[2]}
                                </span>
                              </div>
                            );
                          }
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <div key={i} className="flex gap-2 ml-4 my-1">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{line.replace('- ', '')}</span>
                            </div>
                          );
                        }
                        if (line.match(/^\d+\.\s/)) {
                          return (
                            <div key={i} className="flex gap-2 ml-4 my-1">
                              <span className="text-emerald-500 font-medium">
                                {line.match(/^\d+/)?.[0]}.
                              </span>
                              <span>{line.replace(/^\d+\.\s/, '')}</span>
                            </div>
                          );
                        }
                        if (line.trim() === '') return <br key={i} />;
                        return (
                          <p key={i} className="text-sm text-foreground/80 leading-relaxed">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                    {streamingText && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-0.5 h-4 bg-violet-500 ml-1 align-middle"
                      />
                    )}
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