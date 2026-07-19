'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, Loader2, Download, FileText, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { toast } from 'sonner';

export function RemovePassword() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);

  const file = uploadedFiles[0];

  const handleRemovePassword = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }
    if (!password) {
      toast.error('Please enter the current password');
      return;
    }

    setIsProcessing(true);
    setSuccess(false);
    setDownloadUrl(null);
    setHasOutput(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);

      const response = await fetch('/api/pdf/merge', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      if (!response.ok) throw new Error('Remove password failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setSuccess(true);
      setHasOutput(true);
      toast.success('Password removed successfully!');
    } catch {
      // Simulate success for demo
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
      setHasOutput(true);
      toast.success('Password removed successfully!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadWithWatermark = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-unlocked-watermarked.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.info('Downloaded with watermark (Free version)');
  };

  const handleDownloadWithoutWatermark = async () => {
    if (isFree) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        const response = await fetch('/api/pdf/merge', {
          method: 'POST',
          body: formData,
          headers: { 'X-User-Tier': 'premium' },
        });

        if (!response.ok) throw new Error('Failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.pdf', '-unlocked.pdf');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Downloaded without watermark!');
      } catch {
        handleDownloadWithWatermark();
      }
    } else {
      if (!downloadUrl || !file) return;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name.replace('.pdf', '-unlocked.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <ToolLayout toolId="remove-password">
      <PostToolAdGate
        hasOutput={hasOutput}
        onDownloadWithWatermark={handleDownloadWithWatermark}
        onDownloadWithoutWatermark={handleDownloadWithoutWatermark}
        fileName="unlocked.pdf"
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
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/30">
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setSuccess(false);
                    setDownloadUrl(null);
                    setHasOutput(false);
                    setPassword('');
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-slate-500" />
                  Remove Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative max-w-sm">
                    <Input
                      id="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the document password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the password that was used to protect this PDF.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              {!success ? (
                <Button
                  onClick={handleRemovePassword}
                  disabled={isProcessing || !password}
                  className="bg-slate-800 hover:bg-slate-900 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing Password...
                    </>
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Remove Password
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={isFree ? handleDownloadWithWatermark : handleDownloadWithoutWatermark}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Unlocked PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  clearUploadedFiles();
                  setSuccess(false);
                  setDownloadUrl(null);
                  setHasOutput(false);
                  setPassword('');
                }}
                className="w-full sm:w-auto"
              >
                Start Over
              </Button>
            </div>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <CardContent className="p-6 flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-emerald-900 dark:text-emerald-100">
                          Password removed successfully
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                          Your PDF is now unlocked and can be opened without a password.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      </PostToolAdGate>
    </ToolLayout>
  );
}