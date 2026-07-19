'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    title: 'Product Manager',
    company: 'TechFlow',
    quote:
      'PDFPro AI saved our team hours every week. The merge and compress tools are incredibly fast and the results are always perfect.',
    initials: 'SC',
    color: '#10b981',
  },
  {
    name: 'Marcus Johnson',
    title: 'Freelance Designer',
    company: 'Self-employed',
    quote:
      "I switched from Adobe Acrobat and haven't looked back. The AI summarizer is a game-changer for reviewing client briefs quickly.",
    initials: 'MJ',
    color: '#f59e0b',
  },
  {
    name: 'Priya Sharma',
    title: 'Legal Consultant',
    company: 'Sharma & Associates',
    quote:
      'The security features give me confidence to handle sensitive client documents. Enterprise-grade protection in a beautifully simple tool.',
    initials: 'PS',
    color: '#8b5cf6',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-20 sm:py-28">
      {/* Subtle background accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/40 to-transparent" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      <div ref={ref} className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Loved by Millions Worldwide
          </h2>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            See why professionals and businesses choose PDFPro AI for their document workflows
          </p>
        </motion.div>

        {/* ── Testimonial cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/[0.06] hover:border-emerald-200/60"
            >
              {/* Quote icon */}
              <Quote className="size-8 text-emerald-200 mb-3 shrink-0" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="flex-1 text-sm sm:text-base text-slate-700 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Divider */}
              <div className="mt-6 mb-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <span
                  className="flex size-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.title} at {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}