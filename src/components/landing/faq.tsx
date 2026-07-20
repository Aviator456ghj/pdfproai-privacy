'use client';

import { motion } from 'framer-motion';
import { Plus, Minus, Mail, MessageCircle, Shield, Zap, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How secure are my uploaded PDF files?',
    answer:
      'Your files are encrypted with AES-256 during upload and processing (TLS 1.3). Most importantly, all uploaded files are automatically and permanently deleted from our servers within 2 hours of processing. No human ever accesses your documents, and we never use your files for training or any other purpose. Your data stays yours.',
    icon: Shield,
  },
  {
    question: 'How fast are the AI-powered tools?',
    answer:
      'Our AI tools process most documents in under 10 seconds. Standard operations like merge, split, and compress typically complete in 2–5 seconds depending on file size. AI features like summarization and translation leverage optimized models for near-instant results — even large documents (50+ pages) are processed in seconds, not minutes.',
    icon: Zap,
  },
  {
    question: 'What are the free plan limits?',
    answer:
      'The free plan includes 5 tasks per day with a 10 MB file size limit per file. Free-tier outputs include a watermark and you will see a brief advertisement during processing. This allows us to keep the tools completely free. You can upgrade anytime to remove all limits, watermarks, and ads.',
    icon: Clock,
  },
  {
    question: 'What do I get with Premium?',
    answer:
      'Premium unlocks unlimited daily tasks with no file size restrictions, removes all watermarks from downloads, eliminates advertisements for instant processing, and gives you access to all 100+ tools including advanced AI features like document summarization, translation, and intelligent chat. Premium users also get priority processing and dedicated support.',
    icon: Crown,
  },
  {
    question: 'Will my file quality be affected by compression or conversion?',
    answer:
      'PDFPro AI uses intelligent algorithms that preserve maximum quality. For compression, you choose the level — Low compression maintains near-original quality, while High compression maximizes size reduction. For format conversions (PDF to Word, Excel, etc.), our engine preserves formatting, tables, images, and layout as accurately as possible. AI tools do not modify your original file.',
    icon: MessageCircle,
  },
];

function FaqItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const FaqIcon = faq.icon;
  return (
    <AccordionItem
      value={`item-${index}`}
      className="border-0 rounded-xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-300 data-[state=open]:border-emerald-200/80 data-[state=open]:shadow-sm data-[state=open]:shadow-emerald-100/50"
    >
      <AccordionTrigger className="group text-left text-sm sm:text-[15px] font-semibold text-slate-800 hover:text-emerald-700 hover:no-underline py-4 px-5 gap-3 transition-colors duration-200 [&>svg]:hidden">
        <span className="flex items-center gap-3 flex-1 pr-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors duration-300 group-data-[state=open]:bg-emerald-100">
            <FaqIcon className="h-4 w-4" />
          </span>
          <span className="flex-1">{faq.question}</span>
        </span>
        <span className="relative flex items-center justify-center size-7 rounded-full bg-slate-100 shrink-0 transition-colors duration-300 group-data-[state=open]:bg-emerald-100">
          <Plus className="size-3.5 text-slate-500 absolute transition-all duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:text-emerald-600" />
          <Minus className="size-3.5 text-emerald-600 absolute opacity-0 transition-opacity duration-300 group-data-[state=open]:opacity-100" />
        </span>
      </AccordionTrigger>
      <AccordionContent className="text-sm text-slate-600 leading-relaxed px-5 pb-4 pl-[4.25rem]">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  );
}

export function FAQ() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Everything you need to know about PDFPro AI
          </p>
        </motion.div>

        {/* FAQ list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} />
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-14 text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 rounded-2xl bg-white border border-slate-200/80 px-8 py-8 sm:px-12 sm:py-10 shadow-sm">
            <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <MessageCircle className="size-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Still have questions?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 h-10">
                <Mail className="size-4 mr-2" />
                Contact Support
              </Button>
              <a
                href="mailto:support@pdfpro.ai"
                className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
              >
                support@pdfpro.ai
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}