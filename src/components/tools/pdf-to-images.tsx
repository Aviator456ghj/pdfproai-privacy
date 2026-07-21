'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Loader2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { toast } from 'sonner';

interface ImagePreview {
  url: string;
  name: string;
  page: number;
}

export function PdfToImages() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [quality, setQuality] = useState(90);
  const [pageRange, setPageRange] = useState('all');
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [hasOutput, setHasOutput] = useState(false);

  const file = uploadedFiles[0];

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setPreviews([]);
    setHasOutput(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      formData.append('quality', String(quality));
      formData.append('pageRange', pageRange);

      const response = await fetch('/api/pdf/to-images', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      if (!response.ok) throw new Error('Conversion failed');

      const data = await response.json();
      setPreviews(
        (data.images || []).map((img: { url: string; page: number }, i: number) => ({
          url: img.url,
          name: `page-${img.page}.${format}`,
          page: img.page,
        }))
      );
      setHasOutput(true);
      toast.success(`Converted ${data.images?.length ?? 0} pages to ${format.toUpperCase()}!`);
    } catch {
      toast.error('Failed to convert PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    previews.forEach((img) => {
      const a = document.createElement('a');
      a.href = img.url;
      a.download = img.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const handleDownloadSingle = (img: ImagePreview) => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = img.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="pdf-to-images">
      <PostToolAdGate
        hasOutput={hasOutput}
        onDownloadWithWatermark={() => { handleDownloadAll(); toast.info('Free version — output includes watermark'); }}
        onDownloadWithoutWatermark={() => { handleDownloadAll(); toast.success('Downloaded without watermark!'); }}
        fileName="images.zip"
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <FileText className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { clearUploadedFiles(); setPreviews([]); setHasOutput(false); }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Conversion Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Format */}
                <div className="space-y-2">
                  <Label>Image Format</Label>
                  <RadioGroup
                    value={format}
                    onValueChange={(v) => setFormat(v as 'png' | 'jpg')}
                    className="flex gap-3"
                  >
                    <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:border-violet-300 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50/50">
                      <RadioGroupItem value="png" />
                      <div>
                        <span className="text-sm font-medium">PNG</span>
                        <p className="text-xs text-muted-foreground">Lossless, transparent</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:border-violet-300 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50/50">
                      <RadioGroupItem value="jpg" />
                      <div>
                        <span className="text-sm font-medium">JPG</span>
                        <p className="text-xs text-muted-foreground">Smaller file size</p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <Label>Quality: {quality}%</Label>
                  <Slider
                    value={[quality]}
                    onValueChange={([v]) => setQuality(v)}
                    min={10}
                    max={100}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher quality = larger file size
                  </p>
                </div>

                {/* Page Range */}
                <div className="space-y-2">
                  <Label htmlFor="img-page-range">Page Range</Label>
                  <Input
                    id="img-page-range"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="all or 1-5"
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleConvert}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Convert to {format.toUpperCase()}
                  </>
                )}
              </Button>
            </div>

            {/* Image Previews */}
            <AnimatePresence>
              {previews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      {previews.length} image{previews.length !== 1 ? 's' : ''} generated
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadAll}
                      className="gap-1.5 text-emerald-600 border-emerald-200"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {previews.map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="overflow-hidden group">
                          <div className="aspect-[3/4] bg-muted/30 relative overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleDownloadSingle(img)}
                              >
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Download
                              </Button>
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">Page {img.page}</p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
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