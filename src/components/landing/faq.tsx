'use client';

import { motion } from 'framer-motion';
import { Plus, Minus, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Is PDFPro AI free to use?',
    answer:
      'Yes! PDFPro AI offers a generous free plan with basic PDF tools including merge, split, compress, rotate, and more. You can process up to 5 tasks per day with a 10 MB file size limit. For unlimited usage and AI features, check out our Premium and Business plans.',
  },
  {
    question: 'How secure are my uploaded files?',
    answer:
      'Your security is our top priority. All files are encrypted with AES-256 during upload and processing. Files are automatically deleted from our servers within 2 hours of processing. We never store your documents permanently, and we never share your data with third parties.',
  },
  {
    question: 'What AI features are available?',
    answer:
      'Our AI-powered tools include PDF summarization, AI chat (ask questions about your PDF), translation to 100+ languages, content rewriting, legal document explanation, medical report analysis, study note generation, flashcard creation, table extraction, and key point extraction.',
  },
  {
    question: 'Do I need to install any software?',
    answer:
      'No installation required! PDFPro AI works entirely in your web browser. Simply open the website, upload your PDF, and start working. We support all modern browsers including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.',
  },
  {
    question: 'What file formats can I convert to and from?',
    answer:
      'PDFPro AI supports conversion between PDF and Word (DOCX), Excel (XLSX), PowerPoint (PPTX), images (PNG, JPG), HTML, and EPUB. Our conversion engine preserves formatting, tables, images, and layout as much as possible.',
  },
  {
    question: 'Is there an API for developers?',
    answer:
      'Yes, our Business plan includes full API access. You can integrate PDFPro AI into your applications with our RESTful API. We provide SDKs for Python, JavaScript, Java, and Go, along with comprehensive documentation and code examples.',
  },
  {
    question: 'Can I process multiple files at once?',
    answer:
      'Batch processing is available on Premium and Business plans. You can upload and process hundreds of files simultaneously. Our cloud infrastructure scales automatically to handle your workload, and results are packaged for easy download.',
  },
  {
    question: 'What happens if I exceed my free plan limits?',
    answer:
      "When you reach your daily limit on the free plan, you'll see a friendly notification suggesting you upgrade to Premium. You can continue using the free plan the next day, or upgrade for unlimited access with no waiting.",
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with PDFPro AI, contact our support team and we'll process a full refund — no questions asked.",
  },
  {
    question: 'Can I use PDFPro AI for commercial purposes?',
    answer:
      'Absolutely! Both Premium and Business plans include commercial usage rights. The Business plan additionally offers white-label branding, allowing you to remove our branding and use the tools under your own brand.',
  },
];

function FaqItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  return (
    <AccordionItem
      value={`item-${index}`}
      className="border-0 rounded-xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-300 data-[state=open]:border-emerald-200/80 data-[state=open]:shadow-sm data-[state=open]:shadow-emerald-100/50"
    >
      <AccordionTrigger className="group text-left text-sm sm:text-[15px] font-semibold text-slate-800 hover:text-emerald-700 hover:no-underline py-4 px-5 gap-3 transition-colors duration-200 [&>svg]:hidden">
        <span className="flex-1 pr-4">{faq.question}</span>
        <span className="relative flex items-center justify-center size-7 rounded-full bg-slate-100 shrink-0 transition-colors duration-300 group-data-[state=open]:bg-emerald-100">
          <Plus className="size-3.5 text-slate-500 absolute transition-all duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:text-emerald-600" />
          <Minus className="size-3.5 text-emerald-600 absolute opacity-0 transition-opacity duration-300 group-data-[state=open]:opacity-100" />
        </span>
      </AccordionTrigger>
      <AccordionContent className="text-sm text-slate-600 leading-relaxed px-5 pb-4 border-l-[3px] border-l-emerald-500 ml-5 pl-5 -ml-0">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  );
}

export function FAQ() {
  const leftFaqs = faqs.slice(0, 5);
  const rightFaqs = faqs.slice(5, 10);

  const renderFaqColumn = (items: typeof faqs, startIndex: number) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Accordion type="single" collapsible className="space-y-3">
        {items.map((faq, i) => (
          <FaqItem key={startIndex + i} faq={faq} index={startIndex + i} />
        ))}
      </Accordion>
    </motion.div>
  );

  return (
    <section className="py-20 sm:py-28 bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
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

        {/* 2-column FAQ layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {renderFaqColumn(leftFaqs, 0)}
          {renderFaqColumn(rightFaqs, 5)}
        </div>

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