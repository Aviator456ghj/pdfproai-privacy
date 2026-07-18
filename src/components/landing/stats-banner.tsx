'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  decimals?: number;
}

const stats: StatItem[] = [
  { value: 10, suffix: 'M+', prefix: '', label: 'Documents Processed', decimals: 0 },
  { value: 100, suffix: '+', prefix: '', label: 'Powerful Tools', decimals: 0 },
  { value: 2, suffix: 'M+', prefix: '', label: 'Happy Users', decimals: 0 },
  { value: 99.9, suffix: '%', prefix: '', label: 'Uptime SLA', decimals: 1 },
  { value: 150, suffix: '+', prefix: '', label: 'Countries Served', decimals: 0 },
  { value: 4.9, suffix: '/5', prefix: '', label: 'User Rating', decimals: 1 },
];

function AnimatedCounter({ stat }: { stat: StatItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  const animateCount = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000;
    const startTime = performance.now();
    const decimals = stat.decimals ?? 0;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
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
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums">
        {stat.prefix}
        {displayValue.toFixed(decimals)}
        <span className="text-emerald-300">{stat.suffix}</span>
      </span>
      <span className="mt-2 text-sm sm:text-base text-emerald-100/80 font-medium">
        {stat.label}
      </span>
    </div>
  );
}

export function StatsBanner() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700" />
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />
      </div>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Trusted by Millions Worldwide
          </h2>
          <p className="mt-2 text-emerald-100/80 max-w-lg mx-auto">
            Numbers that speak for themselves. Join the community of professionals who rely on PDFPro AI every day.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-6"
        >
          {stats.map((stat) => (
            <AnimatedCounter key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}