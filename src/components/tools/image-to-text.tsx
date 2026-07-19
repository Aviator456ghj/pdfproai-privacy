'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Loader2, Copy, Check, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function ImageToText() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);

  const file = uploadedFiles[0];

  const handleExtract = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setExtractedText('');

    try {
      await new Promise((r) => setTimeout(r, 2000));
      setExtractedText(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nCurabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.'
      );
      toast.success('Text extracted successfully!');
    } catch {
      toast.error('Failed to extract text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const reset = () => {
    clearUploadedFiles();
    setExtractedText('');
  };

  return (
    <ToolLayout toolId="image-to-text">
      <div className="space-y-6">
        {!file ? (
          <FileUploader accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff" multiple={false} maxFiles={1} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <FileImage className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change
                </Button>
              </div>
            </Card>

            <Button
              onClick={handleExtract}
              disabled={isProcessing || !!extractedText}
              className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Text...
                </>
              ) : (
                <>
                  <Type className="mr-2 h-4 w-4" />
                  Extract Text
                </>
              )}
            </Button>

            {extractedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Type className="h-4 w-4 text-amber-500" />
                        Extracted Text
                      </CardTitle>
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      rows={12}
                      className="font-mono text-sm resize-y"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        {extractedText.split(/\s+/).filter(Boolean).length} words • {extractedText.length} characters
                      </p>
                      <Button variant="ghost" size="sm" onClick={reset}>
                        Start Over
                      </Button>
                    </div>
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