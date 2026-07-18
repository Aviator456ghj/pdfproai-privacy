'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUpDown, Loader2, Download, FileText, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function SortablePageThumbnail({
  page,
  index,
  isOriginal: _isOriginal,
}: {
  page: number;
  index: number;
  isOriginal: boolean;
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
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card
        className={cn(
          'overflow-hidden transition-shadow cursor-default',
          isDragging && 'shadow-xl ring-2 ring-emerald-500/30 scale-105'
        )}
      >
        <div className="aspect-[3/4] bg-muted relative flex items-center justify-center">
          <div className="absolute inset-1 border border-dashed border-muted-foreground/20 rounded" />
          <button
            className="touch-none cursor-grab active:cursor-grabbing absolute top-1 left-1 z-10 bg-white/90 dark:bg-gray-800/90 rounded p-0.5 shadow-sm"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <div className="flex flex-col items-center gap-1">
            <FileText className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded">
              {page}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function RearrangePages() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const file = uploadedFiles[0];

  useMemo(() => {
    if (file) {
      const pages = Math.max(1, Math.floor(file.size / 5000));
      setTotalPages(pages);
      if (pageOrder.length === 0) {
        setPageOrder(Array.from({ length: pages }, (_, i) => i + 1));
      }
    }
  }, [file]);

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
        setPageOrder((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    },
    []
  );

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
      formData.append('order', pageOrder.join(','));

      const response = await fetch('/api/pdf/rearrange', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Rearrange failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('Pages rearranged successfully!');
    } catch {
      toast.error('Failed to rearrange pages. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-rearranged.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="rearrange">
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
                  <p className="text-xs text-muted-foreground">{totalPages} pages</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setPageOrder([]);
                    setDownloadUrl(null);
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            <p className="text-sm text-muted-foreground">
              Drag and drop pages to rearrange their order
            </p>

            {/* Page Grid */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pageOrder.map((_, i) => i)}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {pageOrder.map((page, index) => (
                      <SortablePageThumbnail
                        key={`page-${page}-${index}`}
                        page={page}
                        index={index}
                        isOriginal={page === index + 1}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>

            {/* Order summary */}
            <Card className="p-3">
              <p className="text-xs text-muted-foreground font-mono">
                Current order: {pageOrder.join(', ')}
              </p>
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
                      Rearranging...
                    </>
                  ) : (
                    <>
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Apply New Order
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
                  setPageOrder(Array.from({ length: totalPages }, (_, i) => i + 1));
                }}
                className="w-full sm:w-auto"
              >
                Reset Order
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}