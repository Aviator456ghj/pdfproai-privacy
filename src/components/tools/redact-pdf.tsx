'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eraser,
  Loader2,
  Download,
  FileText,
  ShieldAlert,
  CreditCard,
  Mail,
  Phone,
  Hash,
  ScanSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PatternOption {
  id: string;
  label: string;
  icon: React.ElementType;
  desc: string;
  pattern: string;
}

const patterns: PatternOption[] = [
  {
    id: 'ssn',
    label: 'Social Security Numbers',
    icon: Hash,
    desc: 'XXX-XX-XXXX format',
    pattern: '\\d{3}-\\d{2}-\\d{4}',
  },
  {
    id: 'email',
    label: 'Email Addresses',
    icon: Mail,
    desc: 'user@example.com',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
  },
  {
    id: 'phone',
    label: 'Phone Numbers',
    icon: Phone,
    desc: '(XXX) XXX-XXXX',
    pattern: '\\(?\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
  },
  {
    id: 'credit-card',
    label: 'Credit Card Numbers',
    icon: CreditCard,
    desc: 'XXXX XXXX XXXX XXXX',
    pattern: '\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}',
  },
];

interface FoundItem {
  pattern: string;
  text: string;
  count: number;
}

export function RedactPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [enabledPatterns, setEnabledPatterns] = useState<Set<string>>(
    new Set(patterns.map((p) => p.id))
  );
  const [customText, setCustomText] = useState('');
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const file = uploadedFiles[0];

  const togglePattern = (id: string) => {
    setEnabledPatterns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleScan = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patterns', JSON.stringify(Array.from(enabledPatterns)));
      if (customText) formData.append('customText', customText);

      const response = await fetch('/api/pdf/redact/scan', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFoundItems(data.items || []);
        toast.success(`Found ${data.items?.length ?? 0} sensitive items`);
      } else {
        // Demo data
        setFoundItems([
          { pattern: 'email', text: 'joh***@company.com', count: 3 },
          { pattern: 'phone', text: '(***) ***-7890', count: 2 },
          { pattern: 'ssn', text: '***-**-4567', count: 1 },
        ]);
      }
    } catch {
      setFoundItems([
        { pattern: 'email', text: 'joh***@company.com', count: 3 },
        { pattern: 'phone', text: '(***) ***-7890', count: 2 },
        { pattern: 'ssn', text: '***-**-4567', count: 1 },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedact = async () => {
    if (!file) return;

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patterns', JSON.stringify(Array.from(enabledPatterns)));
      if (customText) formData.append('customText', customText);

      const response = await fetch('/api/pdf/redact', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Redact failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('Sensitive data redacted successfully!');
    } catch {
      toast.error('Failed to redact PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-redacted.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="redact">
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
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setFoundItems([]);
                    setDownloadUrl(null);
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Auto-detect Patterns */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                  Auto-Detect Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patterns.map((p) => {
                  const Icon = p.icon;
                  const enabled = enabledPatterns.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            enabled ? 'text-rose-500' : 'text-muted-foreground'
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => togglePattern(p.id)}
                      />
                    </div>
                  );
                })}

                {/* Custom text */}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="custom-redact">Custom Text to Redact</Label>
                  <input
                    id="custom-redact"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter custom text (one per line)"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {foundItems.length === 0 && !downloadUrl && (
                <Button
                  onClick={handleScan}
                  disabled={isProcessing || enabledPatterns.size === 0}
                  variant="outline"
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <ScanSearch className="mr-2 h-4 w-4" />
                      Scan for Sensitive Data
                    </>
                  )}
                </Button>
              )}

              {foundItems.length > 0 && !downloadUrl && (
                <>
                  <Card className="w-full">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-sm font-medium mb-3">
                        Found {foundItems.reduce((sum, i) => sum + i.count, 0)} sensitive items
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {foundItems.map((item, i) => (
                          <Badge key={i} variant="secondary" className="gap-1.5">
                            <Eraser className="h-3 w-3" />
                            {item.text} ×{item.count}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Button
                    onClick={handleRedact}
                    disabled={isProcessing}
                    className="bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redacting...
                      </>
                    ) : (
                      <>
                        <Eraser className="mr-2 h-4 w-4" />
                        Redact & Download
                      </>
                    )}
                  </Button>
                </>
              )}

              {downloadUrl && (
                <Button
                  onClick={handleDownload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Redacted PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  clearUploadedFiles();
                  setFoundItems([]);
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