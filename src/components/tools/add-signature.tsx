'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileSignature,
  Loader2,
  Download,
  FileText,
  PenTool,
  Type as TypeIcon,
  Eraser,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SignatureMode = 'draw' | 'type';

export function AddSignature() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<SignatureMode>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [fontSize, setFontSize] = useState(36);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);

  const file = uploadedFiles[0];

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    canvas.width = rect?.width ?? 400;
    canvas.height = 200;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    if (mode === 'draw') {
      initCanvas();
      setHasSignature(false);
    }
  }, [mode, initCanvas]);

  useEffect(() => {
    if (mode === 'type' && typedSignature) {
      drawTypedSignature();
    }
  }, [typedSignature, fontSize, mode]);

  const drawTypedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 200;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `italic ${fontSize}px "Georgia", serif`;
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
    setHasSignature(!!typedSignature);
  };

  const getPos = (
    e: React.MouseEvent | React.TouchEvent
  ): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode !== 'draw') return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    if (mode === 'draw') {
      initCanvas();
      setHasSignature(false);
    } else {
      setTypedSignature('');
      setHasSignature(false);
    }
  };

  const handleApply = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }
    if (!hasSignature) {
      toast.error('Please create a signature first');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('No canvas');
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', blob, 'signature.png');

      const response = await fetch('/api/pdf/signature', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      if (!response.ok) throw new Error('Signature failed');

      const resultBlob = await response.blob();
      const url = URL.createObjectURL(resultBlob);
      setDownloadUrl(url);
      setHasOutput(true);
      toast.success('Signature applied successfully!');
    } catch {
      toast.error('Failed to apply signature. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadWithWatermark = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-signed-watermarked.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.info('Downloaded with watermark (Free version)');
  };

  const handleDownloadWithoutWatermark = async () => {
    if (isFree) {
      try {
        const canvas = canvasRef.current;
        if (!canvas || !file) throw new Error('No canvas');
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png')
        );

        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', blob, 'signature.png');

        const response = await fetch('/api/pdf/signature', {
          method: 'POST',
          body: formData,
          headers: {
            'X-User-Tier': 'premium',
          },
        });

        if (!response.ok) throw new Error('Failed');

        const resultBlob = await response.blob();
        const url = URL.createObjectURL(resultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.pdf', '-signed.pdf');
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
      a.download = file.name.replace('.pdf', '-signed.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <ToolLayout toolId="add-signature">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <FileText className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setDownloadUrl(null);
                    setHasSignature(false);
                    setHasOutput(false);
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Signature Mode */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-cyan-500" />
                  Create Your Signature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as SignatureMode)}
                  className="flex gap-3"
                >
                  <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:border-cyan-300 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50 flex-1">
                    <RadioGroupItem value="draw" />
                    <PenTool className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Draw</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:border-cyan-300 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50 flex-1">
                    <RadioGroupItem value="type" />
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Type</span>
                  </label>
                </RadioGroup>

                {/* Type mode controls */}
                {mode === 'type' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <div className="space-y-2">
                      <Label>Type your signature</Label>
                      <Input
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        placeholder="Your Name"
                        className="max-w-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Font Size: {fontSize}px</Label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={([v]) => setFontSize(v)}
                        min={20}
                        max={72}
                        step={2}
                        className="max-w-xs"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Canvas */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className={cn(
                      'w-full h-[200px] border-2 border-dashed rounded-lg',
                      mode === 'draw'
                        ? 'border-muted-foreground/30 cursor-crosshair'
                        : 'border-transparent'
                    )}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                  {mode === 'draw' && !hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-sm text-muted-foreground/50">
                        Draw your signature here
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCanvas}
                  className="gap-1.5 text-muted-foreground"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Clear Signature
                </Button>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleApply}
                  disabled={isProcessing || !hasSignature}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying Signature...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Apply Signature
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
                  Download Signed PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  clearUploadedFiles();
                  setDownloadUrl(null);
                  setHasSignature(false);
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