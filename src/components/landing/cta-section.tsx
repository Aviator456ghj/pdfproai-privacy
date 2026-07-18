'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700" />

      {/* Decorative orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 mb-6">
            <Sparkles className="size-4 text-emerald-200" />
            <span className="text-sm font-medium text-emerald-100">
              No credit card required
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Ready to Simplify Your{' '}
            <span className="text-emerald-200">PDF Workflow?</span>
          </h2>

          <p className="mt-5 text-lg text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Join 2 million+ professionals who save hours every week with PDFPro AI.
            Start with our free plan — no signup required.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl shadow-emerald-900/20 h-12 px-8 text-base font-semibold"
            >
              Get Started Free
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white h-12 px-8 text-base font-medium bg-transparent"
            >
              View All Tools
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}