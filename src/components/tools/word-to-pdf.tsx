'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/tools/file-uploader';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function WordToPdf() {
  const { uploadedFiles, clearUploadedFiles } = useAppStore();
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload a Word document first');
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFiles[0]);

      const response = await fetch('/api/conversion/word-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      toast.success('Document converted to PDF successfully!');
    } catch {
      toast.error('Failed to convert document. Please ensure it is a valid .docx file.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      const originalName = uploadedFiles[0]?.name.replace(/\.[^/.]+$/, '') || 'document';
      a.download = `${originalName}.pdf`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {!resultUrl ? (
        <>
          <FileUploader accept=".docx,.doc" multiple={false} maxFiles={1} />

          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-4">
                <h3 className="font-semibold text-sm mb-2">Conversion Settings</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{uploadedFiles[0].name}</span>
                  <span>→</span>
                  <span className="font-medium text-foreground">PDF</span>
                </div>
              </div>

              <Button
                onClick={handleConvert}
                disabled={processing}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-full sm:w-auto"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Convert to PDF
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
          <h3 className="text-lg font-semibold">Conversion Complete!</h3>
          <p className="text-sm text-muted-foreground">
            Your Word document has been converted to PDF
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => { setResultUrl(null); clearUploadedFiles(); }}
            >
              Convert Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}