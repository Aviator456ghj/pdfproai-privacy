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
import { GripVertical, Plus, Download, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { formatFileSize } from './file-uploader';

function SortableFileItem({
  file,
  index,
  onRemove,
}: {
  file: File;
  index: number;
  onRemove: () => void;
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
        className={`flex items-center gap-3 p-3 group transition-shadow ${
          isDragging ? 'shadow-lg ring-2 ring-emerald-500/30' : ''
        }`}
      >
        <button
          className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
          <FileText className="h-4 w-4 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        <span className="text-xs text-muted-foreground font-mono mr-2">
          #{index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
          onClick={onRemove}
        >
          ×
        </Button>
      </Card>
    </div>
  );
}

export function MergePdf() {
  const { uploadedFiles, setUploadedFiles, removeUploadedFile, addUploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [showUploader, setShowUploader] = useState(true);
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

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) {
      toast.error('Please add at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append('files', file));

      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Merge failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('PDFs merged successfully!');
    } catch {
      toast.error('Failed to merge PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'merged.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAddMore = () => {
    setShowUploader(true);
  };

  return (
    <ToolLayout toolId="merge">
      <div className="space-y-6">
        {showUploader && uploadedFiles.length === 0 ? (
          <FileUploader accept=".pdf" multiple maxFiles={20} />
        ) : null}

        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
              </h3>
              {showUploader ? null : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddMore}
                  className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add More
                </Button>
              )}
            </div>

            {showUploader && uploadedFiles.length > 0 && (
              <FileUploader accept=".pdf" multiple maxFiles={20 - uploadedFiles.length} />
            )}

            <p className="text-xs text-muted-foreground">
              Drag and drop to reorder files. They will be merged in the order shown.
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={uploadedFiles.map((_, i) => i)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {uploadedFiles.map((file, index) => (
                      <SortableFileItem
                        key={`${file.name}-${index}`}
                        file={file}
                        index={index}
                        onRemove={() => removeUploadedFile(index)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!downloadUrl ? (
                <Button
                  onClick={handleMerge}
                  disabled={isProcessing || uploadedFiles.length < 2}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Merging PDFs...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Merge {uploadedFiles.length} PDFs
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
                  Download Merged PDF
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