'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader2, Download, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DeletePages() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const file = uploadedFiles[0];

  // Simulate getting page count
  useMemo(() => {
    if (file) {
      // In a real app, you'd fetch this from an API
      setTotalPages(Math.max(1, Math.floor(file.size / 5000)));
    }
  }, [file]);

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) {
        next.delete(page);
      } else {
        next.add(page);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPages.size === totalPages) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(Array.from({ length: totalPages }, (_, i) => i + 1)));
    }
  };

  const handleDelete = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }
    if (selectedPages.size === 0) {
      toast.error('Please select pages to delete');
      return;
    }
    if (selectedPages.size >= totalPages) {
      toast.error('Cannot delete all pages');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pages', Array.from(selectedPages).sort((a, b) => a - b).join(','));

      const response = await fetch('/api/pdf/delete-pages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Delete failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success(`${selectedPages.size} page(s) deleted successfully!`);
    } catch {
      toast.error('Failed to delete pages. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-edited.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="delete-pages">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <FileText className="h-5 w-5 text-rose-600" />
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
                    setSelectedPages(new Set());
                    setDownloadUrl(null);
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Page Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Select pages to delete{' '}
                  <span className="text-muted-foreground font-normal">
                    ({selectedPages.size} selected)
                  </span>
                </p>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedPages.size === totalPages ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-80 overflow-y-auto pr-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isSelected = selectedPages.has(page);
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => togglePage(page)}
                      className={cn(
                        'relative aspect-[3/4] rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 overflow-hidden',
                        isSelected
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20'
                          : 'border-border hover:border-rose-300 bg-muted/30'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute inset-0 bg-gradient-to-b from-white/80 to-white/20',
                          isSelected && 'from-rose-100/80 to-rose-50/20'
                        )}
                      />
                      {/* Mini page preview */}
                      <div className="relative z-10 flex flex-col items-center gap-1 p-1">
                        <div className="w-6 h-8 bg-white rounded-sm shadow-sm border border-gray-200" />
                        <span
                          className={cn(
                            'text-[10px] font-mono',
                            isSelected ? 'text-rose-600 font-bold' : 'text-muted-foreground'
                          )}
                        >
                          {page}
                        </span>
                      </div>
                      {/* Delete indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-0.5 right-0.5 z-20 h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center"
                          >
                            <Trash2 className="h-2.5 w-2.5 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleDelete}
                  disabled={isProcessing || selectedPages.size === 0}
                  className="bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting Pages...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''}
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
                  setSelectedPages(new Set());
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