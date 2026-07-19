'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Home, Crown, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { getToolById, getRelatedTools, getCategoryById } from '@/lib/tools';
import { cn } from '@/lib/utils';

interface ToolLayoutProps {
  toolId: string;
  children: React.ReactNode;
}

export function ToolLayout({ toolId, children }: ToolLayoutProps) {
  const goHome = useAppStore((s) => s.goHome);
  const clearUploadedFiles = useAppStore((s) => s.clearUploadedFiles);
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const tool = getToolById(toolId);
  const relatedTools = getRelatedTools(toolId);
  const category = tool ? getCategoryById(tool.category) : undefined;

  if (!tool) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Tool not found.</p>
      </div>
    );
  }

  const Icon = tool.icon;
  const isFree = userTier === 'free';

  const handleGoHome = () => {
    clearUploadedFiles();
    goHome();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
    >
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoHome}
          className="text-muted-foreground hover:text-foreground -ml-2 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </motion.div>

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={handleGoHome}
                className="cursor-pointer flex items-center gap-1"
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={handleGoHome}
                className="cursor-pointer"
              >
                {category?.name ?? tool.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{tool.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Tool Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              category?.bgColor ?? 'bg-emerald-50 dark:bg-emerald-900/20'
            )}
          >
            <Icon className={cn('h-6 w-6', category?.color ?? 'text-emerald-600')} />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {tool.name}
              </h1>
              {tool.isPremium && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5">
                  PRO
                </Badge>
              )}
              {tool.isNew && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-[10px] px-2 py-0.5">
                  NEW
                </Badge>
              )}
              {tool.isAI && (
                <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 text-[10px] px-2 py-0.5">
                  AI
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              {tool.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Free Tier Notice Banner */}
      {isFree && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Free Version
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Outputs include watermark • Ads support free access
                </p>
              </div>
            </div>
            <button
              onClick={() => setUserTier('premium')}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shrink-0 shadow-sm"
            >
              <Crown className="h-3.5 w-3.5" />
              Go Premium
            </button>
          </div>
        </motion.div>
      )}

      <Separator className="mb-8" />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {children}
      </motion.main>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Separator className="mb-8" />
          <h2 className="text-lg font-semibold mb-4 text-foreground">Related Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {relatedTools.map((rt) => {
              const RelatedIcon = rt.icon;
              const relCategory = getCategoryById(rt.category);
              return (
                <motion.div
                  key={rt.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 h-full">
                    <CardContent className="p-0 flex items-start gap-3">
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          relCategory?.bgColor ?? 'bg-emerald-50 dark:bg-emerald-900/20'
                        )}
                      >
                        <RelatedIcon
                          className={cn(
                            'h-4 w-4',
                            relCategory?.color ?? 'text-emerald-600'
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{rt.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {rt.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}