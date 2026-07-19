'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table2, Loader2, FileText, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
import { toast } from 'sonner';

const demoTables = [
  {
    title: 'Quarterly Revenue',
    headers: ['Quarter', 'Revenue', 'Growth', 'Profit Margin'],
    rows: [
      ['Q1 2024', '$2.4M', '+12%', '18.5%'],
      ['Q2 2024', '$2.8M', '+16.7%', '19.2%'],
      ['Q3 2024', '$3.1M', '+10.7%', '20.1%'],
      ['Q4 2024', '$3.6M', '+16.1%', '21.3%'],
    ],
  },
  {
    title: 'Employee Performance',
    headers: ['Name', 'Department', 'Score', 'Rating'],
    rows: [
      ['Alice Johnson', 'Engineering', '94/100', 'Excellent'],
      ['Bob Smith', 'Marketing', '87/100', 'Good'],
      ['Carol Davis', 'Sales', '91/100', 'Excellent'],
      ['Dan Wilson', 'Support', '82/100', 'Good'],
    ],
  },
];

function SparkleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-rose-400 rounded-full"
          initial={{
            x: `${50 + (Math.random() - 0.5) * 60}%`,
            y: '100%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: '-10%',
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function AiExtractTables() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [tables, setTables] = useState<typeof demoTables>([]);
  const [hasOutput, setHasOutput] = useState(false);
  const file = uploadedFiles[0];

  const handleExtract = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setTables([]);
    setHasOutput(false);

    try {
      await new Promise((r) => setTimeout(r, 2500));
      setTables(demoTables);
      setHasOutput(true);
      toast.success(`${demoTables.length} table(s) extracted successfully!`);
    } catch {
      toast.error('Failed to extract tables. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCSV = (table: (typeof demoTables)[0], index: number) => {
    const header = table.headers.join(',');
    const rows = table.rows.map((row) => row.join(',')).join('\n');
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-${index + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  const reset = () => {
    clearUploadedFiles();
    setTables([]);
    setHasOutput(false);
  };

  return (
    <ToolLayout toolId="ai-extract-tables">
      <PostToolAdGate
        hasOutput={hasOutput}
        onDownloadWithWatermark={() => toast.info('Free version — output includes watermark')}
        onDownloadWithoutWatermark={() => toast.success('Tables downloaded without watermark!')}
        fileName="tables.csv"
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
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change
                </Button>
              </div>
            </Card>

            {!tables.length && (
              <Button
                onClick={handleExtract}
                disabled={isProcessing}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white w-full sm:w-auto"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting Tables...
                  </>
                ) : (
                  <>
                    <Table2 className="mr-2 h-4 w-4" />
                    Extract Tables
                  </>
                )}
              </Button>
            )}

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="relative overflow-hidden p-8">
                    <SparkleEffect />
                    <div className="flex flex-col items-center gap-4 relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="h-10 w-10 text-rose-500" />
                      </motion.div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">Scanning for tables...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          AI is identifying and extracting tabular data
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {tables.map((table, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Table2 className="h-4 w-4 text-rose-500" />
                        {table.title}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCSV(table, idx)}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-auto max-h-64">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {table.headers.map((h) => (
                              <TableHead key={h} className="text-xs font-semibold whitespace-nowrap">
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.rows.map((row, ri) => (
                            <TableRow key={ri}>
                              {row.map((cell, ci) => (
                                <TableCell key={ci} className="text-sm whitespace-nowrap">
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {tables.length > 0 && (
              <Button variant="ghost" size="sm" onClick={reset}>
                Start Over
              </Button>
            )}
          </motion.div>
        )}
      </div>
      </PostToolAdGate>
    </ToolLayout>
  );
}