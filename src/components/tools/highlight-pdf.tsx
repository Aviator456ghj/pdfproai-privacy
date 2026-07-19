'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Highlighter,
  Loader2,
  Download,
  FileText,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const highlightColors = [
  { value: '#FFEB3B', label: 'Yellow' },
  { value: '#4CAF50', label: 'Green' },
  { value: '#2196F3', label: 'Blue' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#E91E63', label: 'Pink' },
  { value: '#9C27B0', label: 'Purple' },
  { value: '#00BCD4', label: 'Cyan' },
];

interface HighlightSelection {
  id: string;
  text: string;
  color: string;
  page: number;
}

export function HighlightPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [color, setColor] = useState('#FFEB3B');
  const [opacity, setOpacity] = useState(40);
  const [highlights, setHighlights] = useState<HighlightSelection[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);

  const file = uploadedFiles[0];

  const handleAddHighlight = () => {
    if (!selectedText.trim()) {
      toast.error('Please enter text to highlight');
      return;
    }

    const newHighlight: HighlightSelection = {
      id: `hl-${Date.now()}`,
      text: selectedText,
      color,
      page: currentPage,
    };

    setHighlights((prev) => [...prev, newHighlight]);
    setSelectedText('');
    toast.success('Highlight added');
  };

  const removeHighlight = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  const handleExport = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }
    if (highlights.length === 0) {
      toast.error('Please add at least one highlight');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('highlights', JSON.stringify(highlights));

      const response = await fetch('/api/pdf/highlight', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      if (!response.ok) throw new Error('Highlight export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setHasOutput(true);
      toast.success('Highlighted PDF exported!');
    } catch {
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadWithWatermark = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-highlighted-watermarked.pdf');
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
        formData.append('highlights', JSON.stringify(highlights));

        const response = await fetch('/api/pdf/highlight', {
          method: 'POST',
          body: formData,
          headers: {
            'X-User-Tier': 'premium',
          },
        });

        if (!response.ok) throw new Error('Failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.pdf', '-highlighted.pdf');
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
      a.download = file.name.replace('.pdf', '-highlighted.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <ToolLayout toolId="highlight">
      <PostToolAdGate
        hasOutput={hasOutput}
        onDownloadWithWatermark={handleDownloadWithWatermark}
        onDownloadWithoutWatermark={handleDownloadWithoutWatermark}
        fileName="output.pdf"
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setHighlights([]);
                    setDownloadUrl(null);
                    setHasOutput(false);
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Highlight Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Highlighter className="h-4 w-4 text-amber-500" />
                  Highlight Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color picker */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5" />
                    Highlight Color
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {highlightColors.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition-all',
                          color === c.value
                            ? 'border-foreground scale-110 shadow-sm'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                    <div className="relative">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-8 w-8 rounded-full cursor-pointer border-0 p-0"
                        title="Custom color"
                      />
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <Label>Opacity: {opacity}%</Label>
                  <Slider
                    value={[opacity]}
                    onValueChange={([v]) => setOpacity(v)}
                    min={10}
                    max={80}
                    step={5}
                    className="max-w-xs"
                  />
                </div>

                {/* Text to highlight */}
                <div className="space-y-2">
                  <Label htmlFor="hl-text">Text to Highlight</Label>
                  <div className="flex gap-2">
                    <input
                      id="hl-text"
                      value={selectedText}
                      onChange={(e) => setSelectedText(e.target.value)}
                      placeholder="Enter or paste text to highlight..."
                      className="flex-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHighlight()}
                    />
                    <Button
                      onClick={handleAddHighlight}
                      variant="outline"
                      className="shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Highlights list */}
            {highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h3 className="text-sm font-semibold">
                  {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {highlights.map((hl) => (
                    <div
                      key={hl.id}
                      className="flex items-start gap-2 p-2.5 rounded-lg border group"
                    >
                      <div
                        className="h-4 w-4 rounded shrink-0 mt-0.5"
                        style={{ backgroundColor: hl.color, opacity: opacity / 100 }}
                      />
                      <p className="text-sm flex-1 line-clamp-2">{hl.text}</p>
                      <button
                        onClick={() => removeHighlight(hl.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleExport}
                  disabled={isProcessing || highlights.length === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Highlighter className="mr-2 h-4 w-4" />
                      Export Highlighted PDF
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
                  Download PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  clearUploadedFiles();
                  setHighlights([]);
                  setDownloadUrl(null);
                  setHasOutput(false);
                }}
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