'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pen,
  Loader2,
  Download,
  FileText,
  MessageSquare,
  Square,
  Circle,
  Minus,
  Type as TypeIcon,
  StickyNote,
  Send,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AnnotationType = 'comment' | 'note' | 'rectangle' | 'circle' | 'line' | 'text';

interface Annotation {
  id: string;
  type: AnnotationType;
  content: string;
  color: string;
  page: number;
  x?: number;
  y?: number;
}

const annotationColors = [
  { value: '#EF4444', label: 'Red' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#10B981', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#000000', label: 'Black' },
];

const typeOptions: {
  value: AnnotationType;
  label: string;
  icon: React.ElementType;
  needsContent: boolean;
}[] = [
  { value: 'comment', label: 'Comment', icon: MessageSquare, needsContent: true },
  { value: 'note', label: 'Sticky Note', icon: StickyNote, needsContent: true },
  { value: 'text', label: 'Text Box', icon: TypeIcon, needsContent: true },
  { value: 'rectangle', label: 'Rectangle', icon: Square, needsContent: false },
  { value: 'circle', label: 'Circle', icon: Circle, needsContent: false },
  { value: 'line', label: 'Line', icon: Minus, needsContent: false },
];

export function AnnotatePdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedType, setSelectedType] = useState<AnnotationType>('comment');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#EF4444');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const file = uploadedFiles[0];
  const currentTypeOption = typeOptions.find((t) => t.value === selectedType)!;

  const handleAddAnnotation = () => {
    if (currentTypeOption.needsContent && !content.trim()) {
      toast.error('Please enter annotation content');
      return;
    }

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      type: selectedType,
      content,
      color,
      page: currentPage,
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
    setContent('');
    toast.success(`${currentTypeOption.label} added`);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  const handleExport = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }
    if (annotations.length === 0) {
      toast.error('Please add at least one annotation');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('annotations', JSON.stringify(annotations));

      const response = await fetch('/api/pdf/annotate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('Annotated PDF exported!');
    } catch {
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-annotated.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="annotate">
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
              <div className="flex items-center gap-3 justify-between flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                    <FileText className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    ‹
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    ›
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setAnnotations([]);
                    setDownloadUrl(null);
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Annotation Type */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pen className="h-4 w-4 text-cyan-500" />
                  Add Annotation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Selection */}
                <div className="space-y-2">
                  <Label>Annotation Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedType(opt.value)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                            selectedType === opt.value
                              ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-700'
                              : 'border-border hover:border-cyan-300 text-muted-foreground'
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {annotationColors.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={cn(
                          'h-7 w-7 rounded-full border-2 transition-all',
                          color === c.value
                            ? 'border-foreground scale-110'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Content Input */}
                {currentTypeOption.needsContent && (
                  <motion.div
                    key={selectedType}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <Label htmlFor="ann-content">
                      {selectedType === 'comment' ? 'Comment' : selectedType === 'note' ? 'Note Text' : 'Text Content'}
                    </Label>
                    <Textarea
                      id="ann-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={
                        selectedType === 'comment'
                          ? 'Enter your comment...'
                          : selectedType === 'note'
                          ? 'Enter note text...'
                          : 'Enter text...'
                      }
                      className="min-h-[80px] resize-y"
                    />
                  </motion.div>
                )}

                {/* Stroke Width (for shapes) */}
                {!currentTypeOption.needsContent && (
                  <div className="space-y-2">
                    <Label>Stroke Width: {strokeWidth}px</Label>
                    <Slider
                      value={[strokeWidth]}
                      onValueChange={([v]) => setStrokeWidth(v)}
                      min={1}
                      max={8}
                      step={1}
                      className="max-w-xs"
                    />
                  </div>
                )}

                <Button
                  onClick={handleAddAnnotation}
                  variant="outline"
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Add {currentTypeOption.label}
                </Button>
              </CardContent>
            </Card>

            {/* Annotations List */}
            {annotations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h3 className="text-sm font-semibold">
                  {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {annotations.map((ann) => {
                      const typeOpt = typeOptions.find((t) => t.value === ann.type)!;
                      const Icon = typeOpt.icon;
                      return (
                        <motion.div
                          key={ann.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                        >
                          <Card className="flex items-start gap-3 p-3">
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                              style={{ backgroundColor: ann.color + '20' }}
                            >
                              <Icon className="h-3.5 w-3.5" style={{ color: ann.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground">
                                {typeOpt.label} • Page {ann.page}
                              </p>
                              {ann.content && (
                                <p className="text-sm mt-0.5 line-clamp-2">{ann.content}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeAnnotation(ann.id)}
                              className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleExport}
                  disabled={isProcessing || annotations.length === 0}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Annotated PDF
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
                onClick={() => {
                  clearUploadedFiles();
                  setAnnotations([]);
                  setDownloadUrl(null);
                }}
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