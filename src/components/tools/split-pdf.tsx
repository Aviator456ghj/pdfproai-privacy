'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Loader2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function SplitPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [splitMode, setSplitMode] = useState<'range' | 'every' | 'extract'>('every');
  const [pageRange, setPageRange] = useState('1-3');
  const [everyN, setEveryN] = useState(1);
  const [extractPages, setExtractPages] = useState('1, 3, 5');
  const [results, setResults] = useState<string[]>([]);

  const file = uploadedFiles[0];

  const handleSplit = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', splitMode);

      if (splitMode === 'range') {
        formData.append('range', pageRange);
      } else if (splitMode === 'every') {
        formData.append('everyN', String(everyN));
      } else {
        formData.append('pages', extractPages);
      }

      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Split failed');

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setResults(data.files || []);
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setResults([url]);
      }

      toast.success('PDF split successfully!');
    } catch {
      toast.error('Failed to split PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `split-page-${index + 1}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="split">
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
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { clearUploadedFiles(); setResults([]); }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Split Mode Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Split Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={splitMode} onValueChange={(v) => setSplitMode(v as typeof splitMode)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="range">Page Range</TabsTrigger>
                    <TabsTrigger value="every">Every N Pages</TabsTrigger>
                    <TabsTrigger value="extract">Extract Pages</TabsTrigger>
                  </TabsList>

                  <div className="mt-4 space-y-3">
                    <TabsContent value="range" className="mt-0">
                      <div className="space-y-2">
                        <Label htmlFor="pageRange">Page Range</Label>
                        <Input
                          id="pageRange"
                          value={pageRange}
                          onChange={(e) => setPageRange(e.target.value)}
                          placeholder="e.g., 1-3, 5-7"
                          className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter ranges like &quot;1-3&quot; or &quot;1-3, 5-7&quot;
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="every" className="mt-0">
                      <div className="space-y-2">
                        <Label htmlFor="everyN">Split every N pages</Label>
                        <Input
                          id="everyN"
                          type="number"
                          min={1}
                          value={everyN}
                          onChange={(e) => setEveryN(Math.max(1, Number(e.target.value)))}
                          className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          Create a new PDF every {everyN} page{everyN > 1 ? 's' : ''}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="extract" className="mt-0">
                      <div className="space-y-2">
                        <Label htmlFor="extractPages">Pages to Extract</Label>
                        <Input
                          id="extractPages"
                          value={extractPages}
                          onChange={(e) => setExtractPages(e.target.value)}
                          placeholder="e.g., 1, 3, 5-7"
                          className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter specific page numbers separated by commas
                        </p>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSplit}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Splitting PDF...
                  </>
                ) : (
                  <>
                    <Scissors className="mr-2 h-4 w-4" />
                    Split PDF
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold">
                  {results.length} file{results.length !== 1 ? 's' : ''} generated
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((url, i) => (
                    <Card key={i} className="flex items-center justify-between p-3">
                      <span className="text-sm font-medium">Part {i + 1}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleDownload(url, i)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}