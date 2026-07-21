'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, Download, FileText, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { PostToolAdGate } from '@/components/ads/post-tool-ad-gate';
import { useAppStore } from '@/lib/store';
import { useToolAd } from '@/lib/use-tool-ad';
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

export function ProtectPdf() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const { isFree, getFetchOptions } = useToolAd();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [permissions, setPermissions] = useState({
    print: true,
    copy: false,
    edit: false,
    annotate: false,
  });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);

  const file = uploadedFiles[0];

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleProtect = async () => {
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
    setHasOutput(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      formData.append('permissions', JSON.stringify(permissions));

      const response = await fetch('/api/pdf/protect', getFetchOptions({
        method: 'POST',
        body: formData,
      }));

      if (!response.ok) throw new Error('Protect failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setHasOutput(true);
      toast.success('PDF protected successfully!');
    } catch {
      toast.error('Failed to protect PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadWithWatermark = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace('.pdf', '-protected-watermarked.pdf');
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
        formData.append('password', password);
        formData.append('permissions', JSON.stringify(permissions));

        const response = await fetch('/api/pdf/protect', {
          method: 'POST',
          body: formData,
          headers: { 'X-User-Tier': 'premium' },
        });

        if (!response.ok) throw new Error('Failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.pdf', '-protected.pdf');
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
      a.download = file.name.replace('.pdf', '-protected.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <ToolLayout toolId="password-protect">
      <PostToolAdGate
        hasOutput={hasOutput}
        onDownloadWithWatermark={handleDownloadWithWatermark}
        onDownloadWithoutWatermark={handleDownloadWithoutWatermark}
        fileName="protected.pdf"
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
            {/* Current file */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/30">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { clearUploadedFiles(); setDownloadUrl(null); setHasOutput(false); setPassword(''); setConfirmPassword(''); }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-500" />
                  Password Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative max-w-sm">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
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
                  {/* Strength Indicator */}
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative max-w-sm">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
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
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  Document Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { key: 'print' as const, label: 'Allow Printing', desc: 'Users can print the document' },
                  { key: 'copy' as const, label: 'Allow Copying', desc: 'Users can copy text and images' },
                  { key: 'edit' as const, label: 'Allow Editing', desc: 'Users can modify the content' },
                  { key: 'annotate' as const, label: 'Allow Annotations', desc: 'Users can add comments and notes' },
                ]).map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{perm.label}</p>
                      <p className="text-xs text-muted-foreground">{perm.desc}</p>
                    </div>
                    <Switch
                      checked={permissions[perm.key]}
                      onCheckedChange={(checked) =>
                        setPermissions((prev) => ({ ...prev, [perm.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <Button
                  onClick={handleProtect}
                  disabled={isProcessing || !passwordsMatch || strength.score < 2}
                  className="bg-slate-800 hover:bg-slate-900 text-white w-full sm:w-auto"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Protecting PDF...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Protect PDF
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
                  Download Protected PDF
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => { clearUploadedFiles(); setDownloadUrl(null); setHasOutput(false); setPassword(''); setConfirmPassword(''); }}
                className="w-full sm:w-auto"
              >
                Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      </PostToolAdGate>
    </ToolLayout>
  );
}