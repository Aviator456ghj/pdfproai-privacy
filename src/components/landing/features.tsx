'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Brain, Monitor, Layers, Code2, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  shadowColor: string;
  learnMore: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process PDFs in seconds, not minutes. Our optimized engine handles even the largest documents with blazing speed.',
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'hover:shadow-amber-200/60',
    learnMore: 'Processing speeds up to 10x faster',
  },
  {
    icon: Shield,
    title: 'Military-Grade Security',
    description: 'Files are encrypted with AES-256 and automatically deleted after processing. Your data never leaves our secure servers.',
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'hover:shadow-emerald-200/60',
    learnMore: 'SOC 2 Type II compliant infrastructure',
  },
  {
    icon: Brain,
    title: 'AI-Powered',
    description: 'Smart document understanding with AI. Summarize, translate, extract data, and chat with your PDFs like never before.',
    gradient: 'from-rose-500 to-pink-500',
    shadowColor: 'hover:shadow-rose-200/60',
    learnMore: 'Advanced NLP models for document AI',
  },
  {
    icon: Monitor,
    title: 'No Installation',
    description: 'Works in any modern browser on any device. No downloads, no plugins, no setup — just open and start working.',
    gradient: 'from-sky-500 to-cyan-500',
    shadowColor: 'hover:shadow-sky-200/60',
    learnMore: 'Compatible with Chrome, Firefox, Safari, Edge',
  },
  {
    icon: Layers,
    title: 'Batch Processing',
    description: 'Handle hundreds of files at once. Upload a batch and let our engine process them all simultaneously in the cloud.',
    gradient: 'from-violet-500 to-purple-500',
    shadowColor: 'hover:shadow-violet-200/60',
    learnMore: 'Process up to 500 files in a single batch',
  },
  {
    icon: Code2,
    title: 'API Access',
    description: 'Integrate PDFPro AI into your workflow with our RESTful API. Full documentation and SDKs for all major languages.',
    gradient: 'from-orange-500 to-red-500',
    shadowColor: 'hover:shadow-orange-200/60',
    learnMore: 'SDKs for Python, Node.js, Java, Go, and more',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function Features() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Why Choose PDFPro AI?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-base">
            Built for professionals who demand the best. Every feature designed to save you time,
            keep your data safe, and deliver results that exceed expectations.
          </p>
        </motion.div>

        {/* Features grid — 2 columns on desktop, 1 on mobile */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-xl hover:border-transparent ${feature.shadowColor}`}
              >
                {/* Gradient border wrapper on hover */}
                <div
                  className={`pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                />

                {/* Large icon with floating animation */}
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.4,
                    },
                  }}
                  className="mb-5"
                >
                  <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-sm`}>
                    <Icon className="size-6 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <h3 className="text-base font-semibold text-foreground group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Learn more link */}
                <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 opacity-60 group-hover:opacity-100 hover:text-emerald-700 transition-all duration-200">
                  {feature.learnMore}
                  <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Bottom gradient accent bar */}
                <div className={`absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}