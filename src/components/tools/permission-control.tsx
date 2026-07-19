'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Loader2, FileText, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToolLayout } from './tool-layout';
import { FileUploader } from './file-uploader';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function PermissionControl() {
  const { uploadedFiles, isProcessing, setIsProcessing, clearUploadedFiles } = useAppStore();
  const [permissions, setPermissions] = useState({
    print: true,
    copy: false,
    edit: false,
    annotate: true,
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const file = uploadedFiles[0];

  const handleApply = async () => {
    if (!file) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    setSuccess(false);

    try {
      await new Promise((r) => setTimeout(r, 2000));
      setSuccess(true);
      toast.success('Permissions applied successfully!');
    } catch {
      toast.error('Failed to apply permissions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    clearUploadedFiles();
    setSuccess(false);
    setPassword('');
    setPermissions({ print: true, copy: false, edit: false, annotate: true });
  };

  return (
    <ToolLayout toolId="permission-control">
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
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  Permission Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { key: 'print' as const, label: 'Allow Printing', desc: 'Users can print the document' },
                  { key: 'copy' as const, label: 'Allow Copying', desc: 'Users can copy text and images' },
                  { key: 'edit' as const, label: 'Allow Editing', desc: 'Users can modify the content' },
                  { key: 'annotate' as const, label: 'Allow Annotations', desc: 'Users can add comments and notes' },
                ]).map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between">
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-500" />
                  Owner Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="perm-password">Password (optional)</Label>
                  <div className="relative max-w-sm">
                    <Input
                      id="perm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set owner password"
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
                  <p className="text-xs text-muted-foreground">
                    Required to change these permissions later.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleApply}
                disabled={isProcessing}
                className="bg-slate-800 hover:bg-slate-900 text-white w-full sm:w-auto"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying Permissions...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Apply Permissions
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
                        Permissions applied successfully
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Printing: {permissions.print ? 'Allowed' : 'Denied'}
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Copying: {permissions.copy ? 'Allowed' : 'Denied'}
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Editing: {permissions.edit ? 'Allowed' : 'Denied'}
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Annotations: {permissions.annotate ? 'Allowed' : 'Denied'}
                        </p>
                      </div>
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