'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { FileText, Wrench, Users, Clock, Globe, Star } from 'lucide-react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
  icon: React.ElementType;
}

const stats: StatItem[] = [
  { value: 10, suffix: 'M+', label: 'Documents Processed', decimals: 0, icon: FileText },
  { value: 100, suffix: '+', label: 'Powerful Tools', decimals: 0, icon: Wrench },
  { value: 2, suffix: 'M+', label: 'Happy Users', decimals: 0, icon: Users },
  { value: 99.9, suffix: '%', label: 'Uptime SLA', decimals: 1, icon: Clock },
];

function AnimatedCounter({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);
  const Icon = stat.icon;

  const animateCount = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2200;
    const startTime = performance.now();
    const decimals = stat.decimals ?? 0;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * stat.value;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplayValue(stat.value);
      }
    }

    requestAnimationFrame(tick);
  }, [stat.value, stat.decimals]);

  useEffect(() => {
    if (isInView) {
      animateCount();
    }
  }, [isInView, animateCount]);

  const decimals = stat.decimals ?? 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="flex flex-col items-center text-center group relative"
    >
      {/* Icon */}
      <div className="mb-3 inline-flex items-center justify-center size-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors duration-300">
        <Icon className="size-5 text-emerald-200" />
      </div>

      {/* Number */}
      <span
        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-none"
        style={{ fontFeatureSettings: '"tnum"' }}
      >
        {displayValue.toFixed(decimals)}
        <span className="text-emerald-300">{stat.suffix}</span>
      </span>

      {/* Label */}
      <span className="mt-2.5 text-sm sm:text-base text-white/70 font-medium tracking-wide">
        {stat.label}
      </span>
    </motion.div>
  );
}

export function StatsBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Rich emerald-to-teal gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700" />

      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Ambient light effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-teal-400/15 blur-3xl" />
      </div>

      {/* Content with parallax float */}
      <motion.div
        style={{ y }}
        className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24 lg:py-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Trusted by Millions Worldwide
          </h2>
          <p className="mt-3 text-emerald-100/80 max-w-lg mx-auto text-base sm:text-lg">
            Numbers that speak for themselves. Join the community of professionals who rely on PDFPro AI every day.
          </p>
        </motion.div>

        {/* 4-column grid with dividers */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 sm:gap-x-12 gap-y-12 sm:gap-y-14"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="relative">
                {/* Vertical divider (not on last item in row) */}
                {index < 3 && (
                  <div className="hidden lg:block absolute -right-[calc(theme(spacing.4)+theme(spacing.6)/2)] top-0 bottom-0 w-px bg-white/15" />
                )}
                {/* Divider for 2-col mobile */}
                {index % 2 === 0 && (
                  <div className="lg:hidden absolute -bottom-6 sm:-bottom-7 left-0 right-0 h-px bg-white/15" />
                )}
                <AnimatedCounter stat={stat} index={index} />
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}