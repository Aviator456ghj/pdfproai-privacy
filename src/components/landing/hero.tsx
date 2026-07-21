'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Search, Sparkles, Merge, Minimize2, FileText, Brain, ArrowRight,
  Play, CheckCircle2, FileUp, Settings, FileDown,
  BarChart3, Wrench, Users, Star, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { getAllTools } from '@/lib/tools';

/* ─── Data ─── */

const popularSearches = [
  { id: 'merge', label: 'Merge PDF', icon: Merge },
  { id: 'compress', label: 'Compress PDF', icon: Minimize2 },
  { id: 'pdf-to-word', label: 'PDF to Word', icon: FileText },
  { id: 'ai-summarize', label: 'AI Summarize', icon: Brain },
];

const quickStats = [
  { icon: BarChart3, value: '10M+', label: 'Documents Processed' },
  { icon: Wrench, value: '100+', label: 'Tools' },
  { icon: Users, value: '2M+', label: 'Happy Users' },
  { icon: Star, value: '4.9★', label: 'Rating' },
];

const howItWorksSteps = [
  { num: 1, icon: FileUp, title: 'Upload', desc: 'Drag & drop your PDF files' },
  { num: 2, icon: Settings, title: 'Choose Tool', desc: 'Select from 100+ powerful tools' },
  { num: 3, icon: FileDown, title: 'Download', desc: 'Get your processed file instantly' },
];

/* ─── Animation variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Avatar data for trust badge ─── */
const avatarColors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const avatarInitials = ['S', 'M', 'A', 'J', 'K', 'R'];

/* ─── How It Works ─── */

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="mt-20 sm:mt-28 w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
          How It Works
        </h2>
        <p className="mt-2 text-white/70 text-sm sm:text-base">
          Three simple steps to transform your PDFs
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0">
        <div className="hidden sm:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-[2px] bg-white/20" />
        {howItWorksSteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center relative px-4"
            >
              <div className="relative z-10 flex size-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-xl">
                <Icon className="size-8 text-white" />
              </div>
              <span className="absolute -top-2 -right-1 z-20 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow ring-2 ring-emerald-300">
                {step.num}
              </span>
              <h3 className="mt-4 text-base font-semibold text-white drop-shadow-sm">{step.title}</h3>
              <p className="mt-1 text-sm text-white/70 max-w-[200px]">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── MAIN HERO ─────────────────────────── */

export function Hero() {
  const { setSearchQuery, openTool } = useAppStore();
  const [localQuery, setLocalQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const allTools = getAllTools();

  const filteredTools = localQuery.trim()
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(localQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(localQuery.toLowerCase()),
      )
    : [];

  const handleSearch = useCallback(
    (query: string) => {
      setLocalQuery(query);
      setSearchQuery(query);
      setShowResults(query.trim().length > 0);
    },
    [setSearchQuery],
  );

  const handleSelectTool = useCallback(
    (toolId: string) => {
      openTool(toolId);
      setShowResults(false);
    },
    [openTool],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && filteredTools.length === 1) {
        handleSelectTool(filteredTools[0].id);
      }
    },
    [filteredTools, handleSelectTool],
  );

  return (
    <section className="relative overflow-hidden min-h-[92vh] sm:min-h-[88vh] flex items-center">
      {/* ───── Background with generated image ───── */}
      <div className="absolute inset-0 -z-10">
        {/* Base: dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        {/* Generated hero background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/90" />
        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent" />
        {/* Subtle animated mesh blobs */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.35) 0%, rgba(20,184,166,0.15) 40%, transparent 70%)',
            animation: 'hero-blob 12s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.3) 0%, rgba(16,185,129,0.1) 50%, transparent 70%)',
            animation: 'hero-blob 15s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>

      <style>{`
        @keyframes hero-blob {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
      `}</style>

      {/* ───── Main content ───── */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* ── Trust badge with avatars ── */}
          <motion.div variants={fadeUp} className="mb-8 flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {avatarInitials.map((initial, i) => (
                <span
                  key={i}
                  className="flex size-7 items-center justify-center rounded-full border-2 border-white/80 text-[10px] font-bold text-white shadow-lg"
                  style={{ backgroundColor: avatarColors[i] }}
                >
                  {initial}
                </span>
              ))}
            </div>
            <Badge
              variant="secondary"
              className="rounded-full px-3.5 py-1.5 text-sm font-medium border border-white/20 bg-white/10 text-white shadow-sm backdrop-blur-sm"
            >
              <Sparkles className="size-3.5 mr-1" />
              Trusted by 2M+ users worldwide
            </Badge>
          </motion.div>

          {/* ── HEADLINE ── */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl drop-shadow-2xl"
          >
            The{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            PDF Platform
          </motion.h1>

          {/* ── Subheadline ── */}
          <motion.div variants={fadeUp} className="mt-6 max-w-2xl space-y-3">
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Every PDF tool you&apos;ll ever need, powered by cutting-edge AI.
              Merge, compress, convert, edit &amp; transform in seconds.
            </p>
            <ul className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-x-5 gap-y-1.5 text-sm text-white/60">
              {[
                'No installation required',
                'Bank-level encryption',
                'Process files in seconds',
              ].map((prop) => (
                <li key={prop} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  {prop}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── CTA Buttons ── */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold rounded-xl bg-white text-slate-900 hover:bg-white/90 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
              onClick={() => {
                const firstTool = allTools.find((t) => t.id === 'merge');
                if (firstTool) openTool(firstTool.id);
              }}
            >
              <Zap className="size-4 mr-2" />
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base font-semibold rounded-xl border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:bg-white/25 hover:border-white/50 text-white shadow-sm transition-all"
            >
              <Play className="size-4 mr-2 text-emerald-300" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Sub-CTA text */}
          <motion.p variants={fadeUp} className="mt-3 text-xs sm:text-sm text-white/50">
            No signup required &bull; Free forever plan &bull; 100+ tools
          </motion.p>

          {/* ── Search bar ── */}
          <motion.div variants={scaleIn} className="relative mt-10 w-full max-w-xl">
            <div className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-emerald-400" />
              <Input
                type="text"
                placeholder="Search tools... (e.g., merge, compress, AI summarize)"
                className="h-14 pl-12 pr-4 text-base rounded-2xl border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30 text-white"
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
                className="absolute z-50 top-full mt-2 w-full rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl max-h-72 overflow-y-auto"
              >
                {filteredTools.slice(0, 8).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      onMouseDown={() => handleSelectTool(tool.id)}
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{tool.name}</div>
                        <div className="text-xs text-white/50 truncate">{tool.description}</div>
                      </div>
                      {tool.isAI && (
                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-400/30 text-[10px] px-1.5 py-0 shrink-0">
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
                className="absolute z-50 top-full mt-2 w-full rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl p-4 text-center text-sm text-white/60"
              >
                No tools found for &ldquo;{localQuery}&rdquo;
              </motion.div>
            )}
          </motion.div>

          {/* ── Popular search pills ── */}
          <motion.div variants={fadeUp} className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/40 mr-1">Popular:</span>
            {popularSearches.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectTool(s.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-white/80 shadow-sm transition-all hover:border-emerald-300/50 hover:bg-emerald-500/20 hover:text-white hover:shadow-md"
                >
                  <Icon className="size-3.5" />
                  {s.label}
                </button>
              );
            })}
          </motion.div>

          {/* ── Quick Stats glass card row ── */}
          <motion.div variants={fadeUp} className="mt-14 w-full max-w-3xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-md p-4 sm:p-0 shadow-xl">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`flex flex-col items-center text-center py-3 px-4 ${
                      index < quickStats.length - 1 ? 'sm:border-r sm:border-white/15' : ''
                    }`}
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 mb-1.5">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {stat.value}
                    </span>
                    <span className="mt-0.5 text-[11px] sm:text-xs text-white/50 leading-tight">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── How It Works ── */}
          <HowItWorks />
        </motion.div>
      </div>
    </section>
  );
}