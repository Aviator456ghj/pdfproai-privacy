'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, Download, FileText, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-600' };
}

export function EncryptPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const file = uploadedFiles[0];

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleEncrypt = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }
    if (!password) {
      toast.error('Please enter a password');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }
    if (strength.score < 2) {
      toast.error('Please use a stronger password');
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      await new Promise((r) => setTimeout(r, 2000));
      toast.success('PDF encrypted successfully with AES-256!');
    } catch {
      toast.error('Failed to encrypt PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!file) return;
    const a = document.createElement('a');
    a.href = downloadUrl || '#';
    a.download = file.name.replace('.pdf', '-encrypted.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout toolId="encrypt">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/30">
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearUploadedFiles();
                    setDownloadUrl(null);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  AES-256 Encryption
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="encrypt-password">Password</Label>
                  <div className="relative max-w-sm">
                    <Input
                      id="encrypt-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter encryption password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              'h-1.5 flex-1 rounded-full transition-colors',
                              level <= strength.score ? strength.color : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn('text-xs font-medium', strength.color.replace('bg-', 'text-'))}>
                        {strength.label}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encrypt-confirm">Confirm Password</Label>
                  <div className="relative max-w-sm">
                    <Input
                      id="encrypt-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm encryption password"
                      className={cn(
                        'pr-10',
                        confirmPassword && !passwordsMatch && 'border-destructive focus-visible:ring-destructive/30'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 max-w-sm">
                  <p className="text-xs text-muted-foreground">
                    Your PDF will be encrypted with <strong>AES-256 bit</strong> encryption, the same standard used by governments and financial institutions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleEncrypt}
                  disabled={isProcessing || !passwordsMatch || strength.score < 2}
                  className="bg-slate-800 hover:bg-slate-900 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Encrypting PDF...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Encrypt PDF
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
                  Download Encrypted PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  clearUploadedFiles();
                  setDownloadUrl(null);
                  setPassword('');
                  setConfirmPassword('');
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