'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Brain, Monitor, Layers, Code2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process PDFs in seconds, not minutes. Our optimized engine handles even the largest documents with blazing speed.',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-50',
  },
  {
    icon: Shield,
    title: 'Military-Grade Security',
    description: 'Files are encrypted with AES-256 and automatically deleted after processing. Your data never leaves our secure servers.',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-50',
  },
  {
    icon: Brain,
    title: 'AI-Powered',
    description: 'Smart document understanding with AI. Summarize, translate, extract data, and chat with your PDFs like never before.',
    gradient: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-50',
  },
  {
    icon: Monitor,
    title: 'No Installation',
    description: 'Works in any modern browser on any device. No downloads, no plugins, no setup — just open and start working.',
    gradient: 'from-sky-500 to-cyan-500',
    iconBg: 'bg-sky-50',
  },
  {
    icon: Layers,
    title: 'Batch Processing',
    description: 'Handle hundreds of files at once. Upload a batch and let our engine process them all simultaneously in the cloud.',
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-violet-50',
  },
  {
    icon: Code2,
    title: 'API Access',
    description: 'Integrate PDFPro AI into your workflow with our RESTful API. Full documentation and SDKs for all major languages.',
    gradient: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-50',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function Features() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Built for professionals who demand the best. Every feature designed to save you time and keep your data safe.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Icon */}
                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${feature.iconBg} mb-4`}
                >
                  <Icon className="size-6 text-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-foreground group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Subtle gradient accent on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity from-emerald-500 to-teal-500" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}