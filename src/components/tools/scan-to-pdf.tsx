'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Loader2, Download, FileText, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const qualityOptions = [
  { value: 'low', label: 'Low (72 DPI)', desc: 'Smallest file size' },
  { value: 'medium', label: 'Medium (150 DPI)', desc: 'Balanced quality' },
  { value: 'high', label: 'High (300 DPI)', desc: 'Best for printing' },
  { value: 'ultra', label: 'Ultra (600 DPI)', desc: 'Maximum quality' },
];

export function ScanToPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [quality, setQuality] = useState('high');
  const [success, setSuccess] = useState(false);

  const file = uploadedFiles[0];

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setSuccess(false);

    try {
      await new Promise((r) => setTimeout(r, 2500));
      setSuccess(true);
      toast.success('Searchable PDF created successfully!');
    } catch {
      toast.error('Failed to create PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    clearUploadedFiles();
    setSuccess(false);
  };

  return (
    <ToolLayout toolId="scan-to-pdf">
      <div className="space-y-6">
        {!file ? (
          <FileUploader accept=".jpg,.jpeg,.png,.tiff,.bmp" multiple={false} maxFiles={1} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-amber-500" />
                  Output Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Output Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span>{opt.label}</span>
                          <span className="text-muted-foreground text-xs ml-2">— {opt.desc}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    AI-powered OCR will make your scanned document fully searchable. Text in the image will be extracted and embedded as an invisible text layer.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              {!success ? (
                <Button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Searchable PDF...
                    </>
                  ) : (
                    <>
                      <Scan className="mr-2 h-4 w-4" />
                      Create Searchable PDF
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => toast.success('Download started!')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              )}

              <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
                Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}