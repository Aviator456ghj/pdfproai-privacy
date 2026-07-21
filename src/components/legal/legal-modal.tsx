'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function LegalModal({ open, onClose, title, children }: LegalModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[110] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-3xl mx-4 my-8 sm:my-16 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                  <Shield className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="px-6 py-8 max-h-[70vh] overflow-y-auto">
              <div className="prose prose-slate dark:prose-invert max-w-none prose-sm prose-headings:font-semibold prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline">
                {children}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end">
              <Button onClick={onClose} variant="outline" className="rounded-lg">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}