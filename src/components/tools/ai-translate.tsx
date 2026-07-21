'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, Loader2, Download, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { toast } from 'sonner';

const languages = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ru', label: 'Russian' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
  { value: 'tr', label: 'Turkish' },
];

const targetLanguages = languages.filter((l) => l.value !== 'auto');

export function AiTranslate() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);

  const file = uploadedFiles[0];

  const handleTranslate = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);
    setHasOutput(false);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8 + 2;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sourceLang', sourceLang);
      formData.append('targetLang', targetLang);

      const response = await fetch('/api/ai/translate', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) throw new Error('Translate failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setHasOutput(true);
      toast.success('PDF translated successfully!');
    } catch {
      clearInterval(progressInterval);
      toast.error('Failed to translate PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    const targetLabel = targetLanguages.find((l) => l.value === targetLang)?.label ?? targetLang;
    a.download = file.name.replace('.pdf', `-${targetLabel.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadWithWatermark = () => {
    handleDownload();
    toast.info('Free version — output includes watermark');
  };

  const handleDownloadWithoutWatermark = () => {
    handleDownload();
    toast.success('Downloaded without watermark!');
  };

  return (
    <ToolLayout toolId="ai-translate">
      <PostToolAdGate
        hasOutput={hasOutput}
        onDownloadWithWatermark={handleDownloadWithWatermark}
        onDownloadWithoutWatermark={handleDownloadWithoutWatermark}
        fileName="translated.pdf"
      >
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
                  onClick={() => { clearUploadedFiles(); setDownloadUrl(null); setProgress(0); setHasOutput(false); }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Language Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-violet-500" />
                  Translation Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Source Language</Label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Target Language</Label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {targetLanguages.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            {(isProcessing || progress > 0) && progress < 100 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Translating document...</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-purple-500" />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleTranslate}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="mr-2 h-4 w-4" />
                      Translate PDF
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleDownload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Translated PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => { clearUploadedFiles(); setDownloadUrl(null); setProgress(0); setHasOutput(false); }}
                className="w-full sm:w-auto"
              >
                Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      </PostToolAdGate>
    </ToolLayout>
  );
}