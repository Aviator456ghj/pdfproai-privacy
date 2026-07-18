'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Image as ImageIcon,
  Loader2,
  Download,
  GripVertical,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { formatFileSize } from './file-uploader';

type PageSize = 'a4' | 'letter' | 'legal' | 'a3' | 'a5';

function SortableImageItem({
  file,
  index,
  onRemove,
  onPreview,
}: {
  file: File;
  index: number;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`flex items-center gap-3 p-2 group transition-shadow ${
          isDragging ? 'shadow-lg ring-2 ring-emerald-500/30' : ''
        }`}
      >
        <button
          className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground p-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div
          className="h-12 w-12 shrink-0 rounded-lg bg-muted overflow-hidden cursor-pointer border"
          onClick={onPreview}
        >
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        <span className="text-xs text-muted-foreground font-mono mr-1">#{index + 1}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onRemove}
        >
          ×
        </Button>
      </Card>
    </div>
  );
}

export function ImagesToPdf() {
  const {
    uploadedFiles,
    setUploadedFiles,
    removeUploadedFile,
    addUploadedFiles,
    isProcessing,
    setIsProcessing,
    clearUploadedFiles,
  } = useAppStore();

  const [showUploader, setShowUploader] = useState(true);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [margin, setMargin] = useState(20);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = Number(active.id);
        const newIndex = Number(over.id);
        setUploadedFiles(arrayMove(uploadedFiles, oldIndex, newIndex));
      }
    },
    [uploadedFiles, setUploadedFiles]
  );

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      uploadedFiles.forEach((f) => formData.append('images', f));
      formData.append('pageSize', pageSize);
      formData.append('margin', String(margin));

      const response = await fetch('/api/pdf/from-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('PDF created successfully!');
    } catch {
      toast.error('Failed to create PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'images.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="images-to-pdf">
      <div className="space-y-6">
        {showUploader && uploadedFiles.length === 0 && (
          <FileUploader accept="image/png,image/jpeg,image/webp,image/gif" multiple maxFiles={50} />
        )}

        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''}
              </h3>
              {!showUploader && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploader(true)}
                  className="gap-1.5 text-emerald-600 border-emerald-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add More
                </Button>
              )}
            </div>

            {showUploader && uploadedFiles.length > 0 && (
              <FileUploader
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                maxFiles={50 - uploadedFiles.length}
              />
            )}

            <p className="text-xs text-muted-foreground">
              Drag to reorder. Images will be added in this order.
            </p>

            {/* Sortable List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={uploadedFiles.map((_, i) => i)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {uploadedFiles.map((file, index) => (
                      <SortableImageItem
                        key={`${file.name}-${index}`}
                        file={file}
                        index={index}
                        onRemove={() => removeUploadedFile(index)}
                        onPreview={() => {}}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>

            {/* Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">PDF Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Page Size</Label>
                  <RadioGroup
                    value={pageSize}
                    onValueChange={(v) => setPageSize(v as PageSize)}
                    className="flex flex-wrap gap-2"
                  >
                    {(['a4', 'letter', 'legal', 'a3', 'a5'] as PageSize[]).map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer text-sm transition-colors hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50"
                      >
                        <RadioGroupItem value={s} />
                        {s.toUpperCase()}
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Margin: {margin}px</Label>
                  <Slider
                    value={[margin]}
                    onValueChange={([v]) => setMargin(v)}
                    min={0}
                    max={60}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
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
                      Create PDF
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
                  setDownloadUrl(null);
                  setShowUploader(true);
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