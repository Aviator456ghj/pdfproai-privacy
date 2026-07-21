'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const trustIndicators = [
  { icon: '🔒', text: 'Bank-level encryption' },
  { icon: '⚡', text: 'Process in seconds' },
  { icon: '♻️', text: 'Auto-delete after 2 hours' },
];

const floatingCircles = [
  { size: 'w-72 h-72', top: '-10%', left: '-5%', opacity: 'opacity-[0.07]', delay: 0 },
  { size: 'w-96 h-96', top: '20%', right: '-15%', opacity: 'opacity-[0.05]', delay: 0.5 },
  { size: 'w-56 h-56', bottom: '-5%', left: '15%', opacity: 'opacity-[0.06]', delay: 1 },
  { size: 'w-40 h-40', top: '10%', left: '60%', opacity: 'opacity-[0.08]', delay: 1.5 },
  { size: 'w-80 h-80', bottom: '-20%', right: '5%', opacity: 'opacity-[0.04]', delay: 0.8 },
];

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating emerald circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingCircles.map((circle, i) => (
          <motion.div
            key={i}
            className={`absolute ${circle.size} rounded-full bg-emerald-400 ${circle.opacity} blur-2xl`}
            style={{ top: circle.top, left: circle.left, right: circle.right, bottom: circle.bottom }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: circle.delay,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] backdrop-blur-sm border border-white/10 px-4 py-1.5 mb-8"
          >
            <Sparkles className="size-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-200/90">
              No credit card required
            </span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white tracking-tight leading-[1.15]">
            Ready to Simplify Your{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              PDF Workflow?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            Join 2 million+ users who trust PDFPro AI for their document needs.
          </p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl shadow-emerald-900/20 h-13 px-8 text-base font-semibold rounded-full"
            >
              Get Started Free
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30 h-13 px-8 text-base font-medium bg-transparent rounded-full"
            >
              View All Tools
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          >
            {trustIndicators.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-sm text-white/50"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}