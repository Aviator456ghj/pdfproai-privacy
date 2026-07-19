'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileInput, Loader2, FileText, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const simulatedFields = [
  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
  { id: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
  { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', required: false },
  { id: 'address', label: 'Mailing Address', type: 'text', placeholder: '123 Main St, City, State ZIP', required: true },
  { id: 'date', label: 'Date', type: 'date', placeholder: '', required: true },
  { id: 'signature', label: 'Signature / Notes', type: 'textarea', placeholder: 'Additional notes or comments...', required: false },
];

export function FillForms() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const file = uploadedFiles[0];

  const handleFieldChange = (id: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const requiredFields = simulatedFields.filter((f) => f.required);
    const missing = requiredFields.filter((f) => !fieldValues[f.id]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in required fields: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }

    setIsProcessing(true);
    setSubmitted(false);

    try {
      await new Promise((r) => setTimeout(r, 2000));
      setSubmitted(true);
      toast.success('Form filled and submitted successfully!');
    } catch {
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    clearUploadedFiles();
    setFieldValues({});
    setSubmitted(false);
  };

  return (
    <ToolLayout toolId="fill-forms">
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
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change
                </Button>
              </div>
            </Card>

            {!submitted ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileInput className="h-4 w-4 text-cyan-500" />
                      Form Fields
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {simulatedFields.map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <Label htmlFor={field.id} className="text-sm">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            id={field.id}
                            value={fieldValues[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="max-w-md"
                          />
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            value={fieldValues[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="max-w-md"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSubmit}
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
                        <Send className="mr-2 h-4 w-4" />
                        Submit Form
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
                    Start Over
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <CardContent className="p-6 flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-emerald-900 dark:text-emerald-100">
                          Form submitted successfully
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                          All form fields have been filled and saved to your PDF.
                        </p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Submitted Values:</p>
                        {simulatedFields.map((field) => (
                          <div key={field.id} className="flex justify-between py-1 border-b border-muted last:border-0">
                            <span className="text-xs text-muted-foreground">{field.label}</span>
                            <span className="text-xs font-medium">{fieldValues[field.id] || '—'}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" onClick={reset} size="sm">
                        Start Over
                      </Button>
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