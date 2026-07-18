'use client';

import { motion } from 'framer-motion';
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
      'Your security is our top priority. All files are encrypted with AES-256 during upload and processing. Files are automatically deleted from our servers within 1 hour of processing. We never store your documents permanently, and we never share your data with third parties.',
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
    question: 'What file formats can I convert PDFs to and from?',
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
      'When you reach your daily limit on the free plan, you\'ll see a friendly notification suggesting you upgrade to Premium. You can continue using the free plan the next day, or upgrade for unlimited access with no waiting.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Yes, we offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied with PDFPro AI, contact our support team and we\'ll process a full refund — no questions asked.',
  },
  {
    question: 'Can I use PDFPro AI for commercial purposes?',
    answer:
      'Absolutely! Both Premium and Business plans include commercial usage rights. The Business plan additionally offers white-label branding, allowing you to remove our branding and use the tools under your own brand.',
  },
];

export function FAQ() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about PDFPro AI. Can&apos;t find the answer? Contact our support team.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-4 shadow-sm"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-slate-100 last:border-0 px-2"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:text-emerald-700 hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}