'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Merge, Minimize2, FileText, Brain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { getAllTools } from '@/lib/tools';

const quickActions = [
  { id: 'merge', label: 'Merge PDF', icon: Merge, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'compress', label: 'Compress PDF', icon: Minimize2, gradient: 'from-amber-500 to-orange-500' },
  { id: 'pdf-to-word', label: 'PDF to Word', icon: FileText, gradient: 'from-rose-500 to-pink-500' },
  { id: 'ai-summarize', label: 'AI Summarize', icon: Brain, gradient: 'from-violet-500 to-purple-500' },
];

const stats = [
  { value: '10M+', label: 'Documents Processed' },
  { value: '100+', label: 'Tools' },
  { value: '2M+', label: 'Happy Users' },
  { value: '99.9%', label: 'Uptime' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function Hero() {
  const { setSearchQuery, openTool } = useAppStore();
  const [localQuery, setLocalQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const allTools = getAllTools();

  const filteredTools = localQuery.trim()
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(localQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(localQuery.toLowerCase())
      )
    : [];

  const handleSearch = useCallback(
    (query: string) => {
      setLocalQuery(query);
      setSearchQuery(query);
      setShowResults(query.trim().length > 0);
    },
    [setSearchQuery]
  );

  const handleSelectTool = useCallback(
    (toolId: string) => {
      openTool(toolId);
      setShowResults(false);
    },
    [openTool]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && filteredTools.length === 1) {
        handleSelectTool(filteredTools[0].id);
      }
    },
    [filteredTools, handleSelectTool]
  );

  return (
    <section className="relative overflow-hidden pt-16 pb-8 sm:pt-24 sm:pb-12">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(20,184,166,0.08),transparent)]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              <Sparkles className="size-3.5" />
              Trusted by 2M+ users worldwide
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] max-w-4xl"
          >
            Every PDF Tool You&apos;ll{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Ever Need
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
          >
            100+ AI-powered tools to merge, compress, convert, edit, and transform
            your PDFs. All in one beautiful platform — no installation required.
          </motion.p>

          {/* Search bar */}
          <motion.div variants={itemVariants} className="relative mt-10 w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tools... (e.g., merge, compress, AI summarize)"
                className="h-12 pl-12 pr-4 text-base rounded-xl border-emerald-200 bg-white shadow-lg shadow-emerald-500/5 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30"
                value={localQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => localQuery.trim() && setShowResults(true)}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
            </div>

            {/* Search results dropdown */}
            {showResults && filteredTools.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-50 top-full mt-2 w-full rounded-xl border bg-white shadow-xl max-h-72 overflow-y-auto"
              >
                {filteredTools.slice(0, 8).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50/60 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      onMouseDown={() => handleSelectTool(tool.id)}
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{tool.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                      </div>
                      {tool.isAI && (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0">
                          AI
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}

            {showResults && filteredTools.length === 0 && localQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 top-full mt-2 w-full rounded-xl border bg-white shadow-xl p-4 text-center text-sm text-muted-foreground"
              >
                No tools found for &ldquo;{localQuery}&rdquo;
              </motion.div>
            )}
          </motion.div>

          {/* Quick action buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-10 gap-2 rounded-full border-slate-200 bg-white px-4 text-sm font-medium hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                  onClick={() => openTool(action.id)}
                >
                  <div className={`flex size-6 items-center justify-center rounded-md bg-gradient-to-br ${action.gradient} text-white`}>
                    <Icon className="size-3" />
                  </div>
                  {action.label}
                  <ArrowRight className="size-3 text-muted-foreground" />
                </Button>
              );
            })}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={itemVariants}
            className="mt-14 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center px-4 ${
                  index < stats.length - 1 ? 'sm:border-r sm:border-slate-200' : ''
                }`}
              >
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}