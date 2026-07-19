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

/* ─── Animated keyframes injected once via <style> ─── */
const KeyframeStyles = () => (
  <style>{`
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px 4px rgba(16,185,129,0.25), 0 0 60px 10px rgba(16,185,129,0.10); }
      50%      { box-shadow: 0 0 30px 8px rgba(16,185,129,0.35), 0 0 80px 16px rgba(16,185,129,0.15); }
    }
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50%      { transform: translateY(-18px) rotate(3deg); }
    }
    @keyframes float-med {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50%      { transform: translateY(-12px) rotate(-2deg); }
    }
    @keyframes float-fast {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50%      { transform: translateY(-8px) rotate(2deg); }
    }
    @keyframes mesh-move-1 {
      0%, 100% { transform: translate(0%, 0%) scale(1); }
      33%      { transform: translate(30px, -20px) scale(1.1); }
      66%      { transform: translate(-20px, 15px) scale(0.95); }
    }
    @keyframes mesh-move-2 {
      0%, 100% { transform: translate(0%, 0%) scale(1); }
      33%      { transform: translate(-25px, 20px) scale(1.05); }
      66%      { transform: translate(15px, -25px) scale(1.1); }
    }
    @keyframes mesh-move-3 {
      0%, 100% { transform: translate(0%, 0%) scale(1); }
      50%      { transform: translate(20px, 10px) scale(1.08); }
    }
    @keyframes spotlight-pulse {
      0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
      50%      { opacity: 0.6; transform: translateX(-50%) scale(1.05); }
    }
  `}</style>
);

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
  { icon: Star, value: '4.9\u2605', label: 'Rating' },
];

const howItWorksSteps = [
  {
    num: 1,
    icon: FileUp,
    title: 'Upload',
    desc: 'Drag & drop your PDF files',
  },
  {
    num: 2,
    icon: Settings,
    title: 'Choose Tool',
    desc: 'Select from 100+ powerful tools',
  },
  {
    num: 3,
    icon: FileDown,
    title: 'Download',
    desc: 'Get your processed file instantly',
  },
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

/* ─── Floating PDF SVG shape ─── */

function FloatingPdfShape({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 48 60"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M30 0H8C5.8 0 4 1.8 4 4v52c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V18L30 0z"
        fill="currentColor"
        opacity="0.07"
      />
      <path
        d="M30 0v14h14"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.12"
      />
      <rect x="12" y="28" width="24" height="2" rx="1" fill="currentColor" opacity="0.1" />
      <rect x="12" y="34" width="18" height="2" rx="1" fill="currentColor" opacity="0.1" />
      <rect x="12" y="40" width="21" height="2" rx="1" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

/* ─── How It Works sub-component ─── */

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
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          How It Works
        </h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Three simple steps to transform your PDFs
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0">
        {/* Connecting line (desktop only) */}
        <div className="hidden sm:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-[2px] bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-300 opacity-40" />

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
              {/* Numbered circle */}
              <div className="relative z-10 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Icon className="size-8 text-white" />
              </div>
              {/* Step number badge */}
              <span className="absolute -top-2 -right-1 z-20 flex size-6 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-700 shadow ring-2 ring-emerald-100">
                {step.num}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-[200px]">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Avatar data for trust badge ─── */
const avatarColors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const avatarInitials = ['S', 'M', 'A', 'J', 'K', 'R'];

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
    <>
      <KeyframeStyles />

      <section className="relative overflow-hidden pt-12 pb-8 sm:pt-20 sm:pb-12 lg:pt-28">
        {/* ───── Animated mesh gradient background ───── */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/30 to-white" />

          {/* Animated mesh blobs */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.25) 0%, rgba(20,184,166,0.15) 40%, transparent 70%)',
              animation: 'mesh-move-1 12s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.3) 0%, rgba(16,185,129,0.1) 50%, transparent 70%)',
              animation: 'mesh-move-2 15s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(52,211,153,0.25) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)',
              animation: 'mesh-move-3 10s ease-in-out infinite',
            }}
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          {/* ── Floating PDF shapes ── */}
          <FloatingPdfShape
            className="absolute top-[12%] left-[6%] size-10 sm:size-14 text-emerald-600"
            style={{ animation: 'float-slow 7s ease-in-out infinite' }}
          />
          <FloatingPdfShape
            className="absolute top-[22%] right-[8%] size-8 sm:size-12 text-teal-600"
            style={{ animation: 'float-med 9s ease-in-out infinite 1s' }}
          />
          <FloatingPdfShape
            className="absolute bottom-[18%] left-[12%] size-7 sm:size-10 text-emerald-500"
            style={{ animation: 'float-fast 6s ease-in-out infinite 0.5s' }}
          />
          <FloatingPdfShape
            className="absolute bottom-[25%] right-[10%] size-9 sm:size-11 text-teal-500"
            style={{ animation: 'float-slow 11s ease-in-out infinite 2s' }}
          />
          <FloatingPdfShape
            className="absolute top-[55%] left-[3%] size-6 sm:size-8 text-emerald-400 hidden lg:block"
            style={{ animation: 'float-med 8s ease-in-out infinite 3s' }}
          />
          <FloatingPdfShape
            className="absolute top-[8%] right-[25%] size-6 sm:size-7 text-teal-400 hidden md:block"
            style={{ animation: 'float-fast 7s ease-in-out infinite 1.5s' }}
          />
        </div>

        {/* ───── Main content ───── */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
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
                    className="flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: avatarColors[i] }}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <Badge
                variant="secondary"
                className="rounded-full px-3.5 py-1.5 text-sm font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
              >
                <Sparkles className="size-3.5 mr-1" />
                Trusted by 2M+ users worldwide
              </Badge>
            </motion.div>

            {/* ── Spotlight glow behind headline ── */}
            <div className="relative w-full">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[180px] rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, rgba(20,184,166,0.06) 40%, transparent 70%)',
                  animation: 'spotlight-pulse 5s ease-in-out infinite',
                }}
              />

              {/* ── HEADLINE ── */}
              <motion.h1
                variants={fadeUp}
                className="relative text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] max-w-4xl"
              >
                The{' '}
                <span
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #059669, #14b8a6, #10b981, #34d399, #14b8a6, #059669)',
                    backgroundSize: '200% auto',
                    animation: 'shimmer 4s linear infinite',
                  }}
                >
                  AI-Powered
                </span>
                <br />
                PDF Platform
              </motion.h1>
            </div>

            {/* ── Subheadline with value props ── */}
            <motion.div variants={fadeUp} className="mt-6 max-w-2xl space-y-3">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Every PDF tool you&apos;ll ever need, powered by cutting-edge AI.
                Merge, compress, convert, edit &amp; transform in seconds.
              </p>
              <ul className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                {[
                  'No installation required',
                  'Bank-level encryption',
                  'Process files in seconds',
                ].map((prop) => (
                  <li key={prop} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    {prop}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ── CTA Buttons ── */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
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
                className="h-12 px-8 text-base font-semibold rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-slate-50 hover:border-slate-300 text-foreground shadow-sm transition-all"
              >
                <Play className="size-4 mr-2 text-emerald-600" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Sub-CTA text */}
            <motion.p variants={fadeUp} className="mt-3 text-xs sm:text-sm text-muted-foreground">
              No signup required &bull; Free forever plan &bull; 100+ tools
            </motion.p>

            {/* ── Search bar with glassmorphism ── */}
            <motion.div variants={scaleIn} className="relative mt-10 w-full max-w-xl">
              <div
                className="relative rounded-2xl"
                style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
              >
                <div className="relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-emerald-600" />
                  <Input
                    type="text"
                    placeholder="Search tools... (e.g., merge, compress, AI summarize)"
                    className="h-14 pl-12 pr-4 text-base rounded-2xl border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
                    value={localQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => localQuery.trim() && setShowResults(true)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  />
                </div>
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
                        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{tool.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                        </div>
                        {tool.isAI && (
                          <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 shrink-0">
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

            {/* ── Popular search pills ── */}
            <motion.div variants={fadeUp} className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">Popular:</span>
              {popularSearches.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectTool(s.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
                  >
                    <Icon className="size-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </motion.div>

            {/* ── Quick Stats glass card row ── */}
            <motion.div
              variants={fadeUp}
              className="mt-14 w-full max-w-3xl"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md p-4 sm:p-0 shadow-lg shadow-black/[0.03]">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className={`flex flex-col items-center text-center py-3 px-4 ${
                        index < quickStats.length - 1 ? 'sm:border-r sm:border-slate-200/60' : ''
                      }`}
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 mb-1.5">
                        <Icon className="size-4" />
                      </div>
                      <span
                        className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {stat.value}
                      </span>
                      <span className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground leading-tight">
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
    </>
  );
}