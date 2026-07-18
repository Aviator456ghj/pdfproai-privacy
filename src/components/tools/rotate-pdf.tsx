'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Loader2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const rotationOptions = [
  { value: '90', label: '90°', visual: '↻' },
  { value: '180', label: '180°', visual: '⟳' },
  { value: '270', label: '270°', visual: '↺' },
] as const;

export function RotatePdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [angle, setAngle] = useState<string>('90');
  const [applyToAll, setApplyToAll] = useState(true);
  const [specificPages, setSpecificPages] = useState('1, 2, 3');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const file = uploadedFiles[0];

  const handleRotate = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    if (!applyToAll && !specificPages.trim()) {
      toast.error('Please specify pages to rotate');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('angle', angle);
      formData.append('applyToAll', String(applyToAll));
      if (!applyToAll) {
        formData.append('pages', specificPages);
      }

      const response = await fetch('/api/pdf/rotate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Rotate failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('PDF rotated successfully!');
    } catch {
      toast.error('Failed to rotate PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-rotated.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="rotate">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <FileText className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
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

            {/* Rotation Angle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Rotation Angle</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={angle}
                  onValueChange={setAngle}
                  className="grid grid-cols-3 gap-3"
                >
                  {rotationOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                        angle === opt.value
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                          : 'border-border hover:border-emerald-300'
                      }`}
                    >
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <motion.span
                        key={angle}
                        animate={{ rotate: angle === opt.value ? Number(opt.value) : 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className={`text-3xl ${
                          angle === opt.value ? 'text-emerald-600' : 'text-muted-foreground'
                        }`}
                      >
                        <RotateCw className="h-8 w-8" />
                      </motion.span>
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Page Selection */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="apply-all" className="text-sm font-medium">
                      Apply to all pages
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Rotate every page in the document
                    </p>
                  </div>
                  <Switch
                    id="apply-all"
                    checked={applyToAll}
                    onCheckedChange={setApplyToAll}
                  />
                </div>

                {!applyToAll && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <Label htmlFor="specific-pages" className="text-sm">
                      Specific Pages
                    </Label>
                    <Input
                      id="specific-pages"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      placeholder="e.g., 1, 2, 3 or 1-5"
                      className="mt-1.5 max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter page numbers separated by commas or ranges
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleRotate}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rotating...
                    </>
                  ) : (
                    <>
                      <RotateCw className="mr-2 h-4 w-4" />
                      Rotate PDF
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
                  Download Rotated PDF
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