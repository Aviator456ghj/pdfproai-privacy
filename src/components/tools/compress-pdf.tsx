'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Minimize2, Loader2, Download, FileText, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { formatFileSize } from './file-uploader';

type CompressionLevel = 'low' | 'medium' | 'high';

const compressionEstimates: Record<CompressionLevel, number> = {
  low: 0.85,
  medium: 0.6,
  high: 0.35,
};

const compressionLabels: Record<CompressionLevel, { label: string; desc: string }> = {
  low: { label: 'Low Compression', desc: 'Best quality, minimal size reduction' },
  medium: { label: 'Medium Compression', desc: 'Balanced quality and size' },
  high: { label: 'High Compression', desc: 'Maximum compression, lower quality' },
};

export function CompressPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const file = uploadedFiles[0];
  const originalSize = file?.size ?? 0;
  const estimatedSize = useMemo(
    () => Math.round(originalSize * compressionEstimates[level]),
    [originalSize, level]
  );
  const savedPercent = useMemo(() => {
    if (!originalSize) return 0;
    return Math.round((1 - compressionEstimates[level]) * 100);
  }, [originalSize, level]);

  const handleCompress = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('level', level);

      const response = await fetch('/api/pdf/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Compress failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setCompressedSize(blob.size);
      toast.success('PDF compressed successfully!');
    } catch {
      toast.error('Failed to compress PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file?.name.replace('.pdf', '-compressed.pdf') ?? 'compressed.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="compress">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <FileText className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(originalSize)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { clearUploadedFiles(); setDownloadUrl(null); }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Compression Level */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Compression Level</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={level}
                  onValueChange={(v) => setLevel(v as CompressionLevel)}
                  className="space-y-3"
                >
                  {(Object.keys(compressionLabels) as CompressionLevel[]).map((l) => (
                    <label
                      key={l}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        level === l
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-border hover:border-emerald-300'
                      }`}
                    >
                      <RadioGroupItem value={l} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{compressionLabels[l].label}</p>
                        <p className="text-xs text-muted-foreground">
                          {compressionLabels[l].desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Size Comparison */}
            {originalSize > 0 && !downloadUrl && (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Original</p>
                      <p className="text-lg font-bold">{formatFileSize(originalSize)}</p>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <ArrowDown className="h-5 w-5 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600">
                        -{savedPercent}%
                      </span>
                    </div>

                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Estimated</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatFileSize(estimatedSize)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Compressed Result */}
            {downloadUrl && compressedSize > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-6 border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                      Compression Complete!
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(originalSize)}
                      </span>
                      <ArrowDown className="h-4 w-4 text-emerald-500" />
                      <span className="text-lg font-bold text-emerald-600">
                        {formatFileSize(compressedSize)}
                      </span>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        -{Math.round((1 - compressedSize / originalSize) * 100)}%
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Minimize2 className="mr-2 h-4 w-4" />
                      Compress PDF
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
                  Download Compressed PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => { clearUploadedFiles(); setDownloadUrl(null); }}
                className="w-full sm:w-auto"
              >
                Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}