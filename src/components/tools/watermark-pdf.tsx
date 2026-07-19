'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Loader2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type WatermarkPosition =
  | 'center'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'diagonal';

const positions: { value: WatermarkPosition; label: string; grid: string }[] = [
  { value: 'diagonal', label: 'Diagonal', grid: '' },
  { value: 'top-left', label: 'Top Left', grid: 'col-1 row-1' },
  { value: 'top-center', label: 'Top Center', grid: 'col-2 row-1' },
  { value: 'top-right', label: 'Top Right', grid: 'col-3 row-1' },
  { value: 'center', label: 'Center', grid: 'col-2 row-2' },
  { value: 'bottom-left', label: 'Bottom Left', grid: 'col-1 row-3' },
  { value: 'bottom-center', label: 'Bottom Center', grid: 'col-2 row-3' },
  { value: 'bottom-right', label: 'Bottom Right', grid: 'col-3 row-3' },
];

export function WatermarkPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#888888');
  const [opacity, setOpacity] = useState(30);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState<WatermarkPosition>('diagonal');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const file = uploadedFiles[0];

  const handleApply = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }
    if (!text.trim()) {
      toast.error('Please enter watermark text');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', text);
      formData.append('fontSize', String(fontSize));
      formData.append('color', color);
      formData.append('opacity', String(opacity / 100));
      formData.append('rotation', String(rotation));
      formData.append('position', position);

      const response = await fetch('/api/pdf/watermark', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Watermark failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('Watermark applied successfully!');
    } catch {
      toast.error('Failed to apply watermark. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-watermarked.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const previewRotation =
    position === 'diagonal' ? -45 : rotation;

  return (
    <ToolLayout toolId="watermark">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <FileText className="h-5 w-5 text-cyan-600" />
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

            {/* Watermark Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Watermark Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Text */}
                <div className="space-y-2">
                  <Label htmlFor="wm-text">Watermark Text</Label>
                  <Input
                    id="wm-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="max-w-sm"
                  />
                </div>

                {/* Font Size & Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Font Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([v]) => setFontSize(v)}
                      min={12}
                      max={120}
                      step={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded border border-input"
                      />
                      <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="max-w-[120px] font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Opacity & Rotation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Opacity: {opacity}%</Label>
                    <Slider
                      value={[opacity]}
                      onValueChange={([v]) => setOpacity(v)}
                      min={5}
                      max={100}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rotation: {rotation}°</Label>
                    <Slider
                      value={[rotation]}
                      onValueChange={([v]) => setRotation(v)}
                      min={-180}
                      max={180}
                      step={5}
                    />
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={position} onValueChange={(v) => setPosition(v as WatermarkPosition)}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-48 bg-white border border-border rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_20px)]" />
                  <motion.span
                    key={`${text}-${fontSize}-${color}-${opacity}-${previewRotation}-${position}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      fontSize: `${Math.min(fontSize, 40)}px`,
                      color: color,
                      opacity: opacity / 100,
                      transform: `rotate(${previewRotation}deg)`,
                      position: 'absolute',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                    className="font-bold tracking-widest"
                  >
                    {text || 'Preview'}
                  </motion.span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleApply}
                  disabled={isProcessing || !text.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying Watermark...
                    </>
                  ) : (
                    <>
                      <Droplets className="mr-2 h-4 w-4" />
                      Apply Watermark
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
                  Download Watermarked PDF
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