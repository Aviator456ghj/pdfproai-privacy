'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function FileUploader({
  accept = '.pdf',
  multiple = false,
  maxFiles = 20,
  maxSize = 100 * 1024 * 1024, // 100MB default
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Record<string, number>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addUploadedFiles, uploadedFiles, removeUploadedFile } = useAppStore();

  const simulateProgress = useCallback(
    (fileName: string) => {
      let progress = 0;
      setUploadingFiles((prev) => ({ ...prev, [fileName]: 0 }));

      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            setUploadingFiles((prev) => {
              const next = { ...prev };
              delete next[fileName];
              return next;
            });
          }, 300);
        }
        setUploadingFiles((prev) => ({ ...prev, [fileName]: Math.min(progress, 100) }));
      }, 100);
    },
    []
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (maxSize && file.size > maxSize) {
          toast.error(`File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`);
          return false;
        }
        return true;
      });

      if (uploadedFiles.length + validFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      validFiles.forEach((file) => simulateProgress(file.name));
      addUploadedFiles(validFiles);

      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added`);
      }
    },
    [addUploadedFiles, maxFiles, maxSize, simulateProgress, uploadedFiles.length]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleClick = () => fileInputRef.current?.click();

  const getAcceptLabel = () => {
    if (!accept) return 'any file';
    const types = accept.split(',').map((t) => t.trim().toUpperCase().replace('.', ''));
    return types.join(', ');
  };

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className="relative cursor-pointer"
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <Card
          className={`relative overflow-hidden border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-muted-foreground/25 hover:border-emerald-400/50 hover:bg-muted/30'
          }`}
        >
          <AnimatePresence>
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={isDragOver ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={isDragOver ? { rotate: [0, -5, 5, 0] } : {}}
              transition={{ duration: 0.5, repeat: isDragOver ? Infinity : 0 }}
              className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4"
            >
              <Upload
                className={`h-8 w-8 transition-colors ${
                  isDragOver ? 'text-emerald-600' : 'text-emerald-500'
                }`}
              />
            </motion.div>

            <div>
              <p className="text-base font-semibold text-foreground">
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or <span className="text-emerald-600 font-medium underline underline-offset-2">browse files</span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground/70">
              Supports {getAcceptLabel()} {multiple ? '• Multiple files' : '• Single file'}
              {maxSize ? ` • Max ${formatFileSize(maxSize)}` : ''}
            </p>
          </motion.div>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </motion.div>

      <AnimatePresence mode="popLayout">
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Card className="flex items-center gap-3 p-3 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    {uploadingFiles[file.name] !== undefined ? (
                      <Progress
                        value={uploadingFiles[file.name]}
                        className="h-2 w-6 [&>div]:bg-emerald-500"
                      />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUploadedFile(index);
                      toast.info('File removed');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { formatFileSize };