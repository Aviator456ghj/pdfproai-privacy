'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Loader2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
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

type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

type NumberFormat = 'numeric' | 'roman';

export function PageNumbersPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [format, setFormat] = useState<NumberFormat>('numeric');
  const [fontSize, setFontSize] = useState(12);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const file = uploadedFiles[0];

  const handleApply = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('position', position);
      formData.append('startNumber', String(startNumber));
      formData.append('format', format);
      formData.append('fontSize', String(fontSize));

      const response = await fetch('/api/pdf/page-numbers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('Page numbers added successfully!');
    } catch {
      toast.error('Failed to add page numbers. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-numbered.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getPreviewNumber = () => {
    if (format === 'roman') {
      const num = startNumber;
      const romanNumerals = [
        '', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
      ];
      return romanNumerals[num] ?? String(num);
    }
    return String(startNumber);
  };

  return (
    <ToolLayout toolId="page-numbers">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <FileText className="h-5 w-5 text-amber-600" />
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

            {/* Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Page Number Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Position */}
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={position}
                    onValueChange={(v) => setPosition(v as PageNumberPosition)}
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Format */}
                <div className="space-y-2">
                  <Label>Number Format</Label>
                  <RadioGroup
                    value={format}
                    onValueChange={(v) => setFormat(v as NumberFormat)}
                    className="flex gap-3"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="numeric" />
                      <span className="text-sm">1, 2, 3...</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="roman" />
                      <span className="text-sm">i, ii, iii...</span>
                    </label>
                  </RadioGroup>
                </div>

                {/* Start Number & Font Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-num">Start Number</Label>
                    <Input
                      id="start-num"
                      type="number"
                      min={0}
                      value={startNumber}
                      onChange={(e) => setStartNumber(Math.max(0, Number(e.target.value)))}
                      className="max-w-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([v]) => setFontSize(v)}
                      min={6}
                      max={24}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-48 bg-white border border-border rounded-lg overflow-hidden">
                  <div className="absolute inset-2 border border-dashed border-gray-200 rounded" />
                  {/* Page number indicator */}
                  <motion.div
                    key={`${position}-${fontSize}-${format}-${startNumber}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute ${
                      position.includes('top') ? 'top-3' : 'bottom-3'
                    } ${
                      position.includes('left') ? 'left-4' : position.includes('right') ? 'right-4' : 'left-1/2 -translate-x-1/2'
                    }`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <span className="text-gray-500 font-mono">{getPreviewNumber()}</span>
                  </motion.div>
                  {/* Page content placeholder */}
                  <div className="absolute top-8 left-6 right-6 bottom-8 space-y-2">
                    <div className="h-2 bg-gray-100 rounded w-full" />
                    <div className="h-2 bg-gray-100 rounded w-5/6" />
                    <div className="h-2 bg-gray-100 rounded w-4/5" />
                    <div className="h-2 bg-gray-100 rounded w-full" />
                    <div className="h-2 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleApply}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Page Numbers...
                    </>
                  ) : (
                    <>
                      <Hash className="mr-2 h-4 w-4" />
                      Add Page Numbers
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
                  Download PDF
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