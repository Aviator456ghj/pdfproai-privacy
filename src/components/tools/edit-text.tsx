'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileEdit,
  Loader2,
  Download,
  FileText,
  Save,
  ChevronLeft,
  ChevronRight,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { toast } from 'sonner';

interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  page: number;
}

export function EditText() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);

  const file = uploadedFiles[0];

  const handleFileLoaded = async () => {
    if (!file) return;
    // Simulate extracting text blocks
    const pageCount = Math.max(1, Math.floor(file.size / 5000));
    setTotalPages(pageCount);
    setCurrentPage(1);

    const demoBlocks: TextBlock[] = [
      { id: 'b1', text: 'This is the first paragraph of the document. It contains important information that you may want to edit.', x: 50, y: 80, page: 1 },
      { id: 'b2', text: 'The second paragraph provides additional context and supporting details for the main topic discussed above.', x: 50, y: 140, page: 1 },
      { id: 'b3', text: 'Section 1: Introduction', x: 50, y: 50, page: 1 },
      { id: 'b4', text: 'This section introduces the key concepts and sets the stage for the detailed analysis that follows.', x: 50, y: 200, page: 1 },
    ];
    setTextBlocks(demoBlocks);
  };

  React.useEffect(() => {
    if (file && textBlocks.length === 0) {
      handleFileLoaded();
    }
  }, [file]);

  const currentPageBlocks = textBlocks.filter((b) => b.page === currentPage);

  const updateBlockText = (id: string, text: string) => {
    setTextBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text } : b))
    );
  };

  const handleSave = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('changes', JSON.stringify(textBlocks));

      const response = await fetch('/api/pdf/edit-text', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      if (!response.ok) throw new Error('Edit failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setHasOutput(true);
      toast.success('Text edits saved successfully!');
    } catch {
      toast.error('Failed to save edits. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadWithWatermark = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-edited-watermarked.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.info('Downloaded with watermark (Free version)');
  };

  const handleDownloadWithoutWatermark = async () => {
    if (isFree) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('changes', JSON.stringify(textBlocks));

        const response = await fetch('/api/pdf/edit-text', {
          method: 'POST',
          body: formData,
          headers: {
            'X-User-Tier': 'premium',
          },
        });

        if (!response.ok) throw new Error('Failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.pdf', '-edited.pdf');
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
      a.download = file.name.replace('.pdf', '-edited.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <ToolLayout toolId="edit-text">
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
            {/* File header + page navigation */}
            <Card className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                    <FileText className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{totalPages} pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[80px] text-center">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setTextBlocks([]);
                    setDownloadUrl(null);
                    setHasOutput(false);
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Editable Content Area */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="h-4 w-4 text-cyan-500" />
                  Text Content — Page {currentPage}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentPageBlocks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No editable text blocks on this page.
                  </p>
                ) : (
                  currentPageBlocks.map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg border p-3 transition-all cursor-pointer ${
                        selectedBlock === block.id
                          ? 'border-cyan-500 bg-cyan-50/30 dark:bg-cyan-950/10'
                          : 'border-border hover:border-cyan-300'
                      }`}
                      onClick={() => setSelectedBlock(block.id)}
                    >
                      <Textarea
                        value={block.text}
                        onChange={(e) => updateBlockText(block.id, e.target.value)}
                        className="min-h-[60px] resize-y text-sm border-0 shadow-none p-0 focus-visible:ring-0 bg-transparent"
                        rows={2}
                      />
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
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
                  Download Edited PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => { handleFileLoaded(); setDownloadUrl(null); setHasOutput(false); }}
                className="w-full sm:w-auto"
              >
                Reset Edits
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      </PostToolAdGate>
    </ToolLayout>
  );
}