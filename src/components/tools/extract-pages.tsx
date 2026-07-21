'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/tools/file-uploader';
import { ToolLayout } from '@/components/tools/tool-layout';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function ExtractPages() {
  const { uploadedFiles, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [pageRange, setPageRange] = useState('1,3,5-7');
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);

  const handleExtract = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload a PDF file first');
      return;
    }
    if (!pageRange.trim()) {
      toast.error('Please specify pages to extract');
      return;
    }

    setProcessing(true);
    setHasOutput(false);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFiles[0]);
      formData.append('pages', pageRange);

      const response = await fetch('/api/pdf/extract-pages', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      if (!response.ok) throw new Error('Failed to extract pages');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setHasOutput(true);
      toast.success('Pages extracted successfully!');
    } catch {
      toast.error('Failed to extract pages. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadWithWatermark = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'extracted-pages-watermarked.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.info('Downloaded with watermark (Free version)');
  };

  const handleDownloadWithoutWatermark = async () => {
    if (isFree) {
      try {
        const formData = new FormData();
        formData.append('file', uploadedFiles[0]);
        formData.append('pages', pageRange);

        const response = await fetch('/api/pdf/extract-pages', {
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
        a.download = 'extracted-pages.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Downloaded without watermark!');
      } catch {
        handleDownloadWithWatermark();
      }
    } else {
      if (!resultUrl) return;
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'extracted-pages.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <ToolLayout toolId="extract-pages">
      <PostToolAdGate
        hasOutput={hasOutput}
        onDownloadWithWatermark={handleDownloadWithWatermark}
        onDownloadWithoutWatermark={handleDownloadWithoutWatermark}
        fileName="extracted-pages.pdf"
      >
        <div className="space-y-6">
          {!resultUrl ? (
            <>
              <FileUploader accept=".pdf" multiple={false} maxFiles={1} />

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="rounded-xl border bg-card p-4 space-y-4">
                    <h3 className="font-semibold text-sm">Extraction Options</h3>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Pages to Extract</label>
                      <Input
                        value={pageRange}
                        onChange={(e) => setPageRange(e.target.value)}
                        placeholder="e.g., 1,3,5-7"
                        className="max-w-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use commas for individual pages and dashes for ranges
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleExtract}
                    disabled={processing}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-full sm:w-auto"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Extract Pages
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold">Pages Extracted Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Your extracted pages are ready for download
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={isFree ? handleDownloadWithWatermark : handleDownloadWithoutWatermark}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setResultUrl(null); setHasOutput(false); clearUploadedFiles(); }}
                >
                  Extract More Pages
                </Button>
              </div>
            </div>
          )}
        </div>
      </PostToolAdGate>
    </ToolLayout>
  );
}