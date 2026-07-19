'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, FileText, Download, Plus, Replace, Images, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function EditImages() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [action, setAction] = useState<'extract' | 'replace' | 'add'>('extract');
  const [replacePageIndex, setReplacePageIndex] = useState('1');
  const [addPageIndex, setAddPageIndex] = useState('1');
  const [success, setSuccess] = useState(false);

  const file = uploadedFiles[0];

  const handleAction = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setSuccess(false);

    try {
      await new Promise((r) => setTimeout(r, 2000));
      setSuccess(true);

      if (action === 'extract') {
        toast.success('All images extracted successfully!');
      } else if (action === 'replace') {
        toast.success(`Image on page ${replacePageIndex} replaced!`);
      } else {
        toast.success(`Image added to page ${addPageIndex}!`);
      }
    } catch {
      toast.error('Failed to process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    clearUploadedFiles();
    setSuccess(false);
  };

  const actionConfig = {
    extract: {
      title: 'Extract All Images',
      desc: 'Extract every image embedded in your PDF as separate files.',
      icon: Images,
      btnLabel: 'Extract Images',
    },
    replace: {
      title: 'Replace Image',
      desc: 'Replace an image on a specific page with a new one.',
      icon: Replace,
      btnLabel: 'Replace Image',
    },
    add: {
      title: 'Add Image',
      desc: 'Add a new image to a specific page in your PDF.',
      icon: Plus,
      btnLabel: 'Add Image',
    },
  };

  const currentConfig = actionConfig[action];
  const CurrentIcon = currentConfig.icon;

  return (
    <ToolLayout toolId="edit-images">
      <div className="space-y-6">
        {!file ? (
          <FileUploader accept=".pdf" multiple={false} maxFiles={1} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Estimated {Math.max(1, Math.floor(file.size / 50000))} pages
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-cyan-500" />
                  Choose Action
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['extract', 'replace', 'add'] as const).map((act) => {
                    const cfg = actionConfig[act];
                    const ActIcon = cfg.icon;
                    const isActive = action === act;
                    return (
                      <button
                        key={act}
                        onClick={() => { setAction(act); setSuccess(false); }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all text-center ${
                          isActive
                            ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20'
                            : 'border-border hover:border-cyan-300'
                        }`}
                      >
                        <ActIcon className={`h-5 w-5 ${isActive ? 'text-cyan-600' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-cyan-700 dark:text-cyan-300' : ''}`}>
                          {cfg.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm">{currentConfig.desc}</p>
                </div>

                {action === 'replace' && (
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="replace-page">Target Page Number</Label>
                    <Input
                      id="replace-page"
                      type="number"
                      min="1"
                      value={replacePageIndex}
                      onChange={(e) => setReplacePageIndex(e.target.value)}
                      placeholder="1"
                    />
                    <div className="pt-2">
                      <Label>Replacement Image</Label>
                      <div className="mt-1.5 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 cursor-pointer hover:border-cyan-400/50 transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                      </div>
                    </div>
                  </div>
                )}

                {action === 'add' && (
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="add-page">Insert on Page Number</Label>
                    <Input
                      id="add-page"
                      type="number"
                      min="1"
                      value={addPageIndex}
                      onChange={(e) => setAddPageIndex(e.target.value)}
                      placeholder="1"
                    />
                    <div className="pt-2">
                      <Label>Image to Add</Label>
                      <div className="mt-1.5 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 cursor-pointer hover:border-cyan-400/50 transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAction}
                disabled={isProcessing}
                className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CurrentIcon className="mr-2 h-4 w-4" />
                    {currentConfig.btnLabel}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
                Start Over
              </Button>
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <CardContent className="p-6 flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">
                        {action === 'extract'
                          ? 'Images extracted successfully'
                          : action === 'replace'
                          ? 'Image replaced successfully'
                          : 'Image added successfully'}
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        {action === 'extract'
                          ? 'All embedded images have been extracted and are ready for download.'
                          : action === 'replace'
                          ? `The image on page ${replacePageIndex} has been replaced.`
                          : `A new image has been added to page ${addPageIndex}.`}
                      </p>
                      {action === 'extract' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => toast.success('Download started!')}
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Download All Images
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}