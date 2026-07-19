'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAppStore } from '@/lib/store';
import { Hero } from '@/components/landing/hero';
import { ToolsGrid } from '@/components/landing/tools-grid';
import { Features } from '@/components/landing/features';
import { Pricing } from '@/components/landing/pricing';
import { FAQ } from '@/components/landing/faq';
import { StatsBanner } from '@/components/landing/stats-banner';
import { CTASection } from '@/components/landing/cta-section';
import { Testimonials } from '@/components/landing/testimonials';
import { lazy, Suspense } from 'react';

// Lazy load tool components for performance
const MergePdf = lazy(() => import('@/components/tools/merge-pdf').then(m => ({ default: m.MergePdf })));
const SplitPdf = lazy(() => import('@/components/tools/split-pdf').then(m => ({ default: m.SplitPdf })));
const CompressPdf = lazy(() => import('@/components/tools/compress-pdf').then(m => ({ default: m.CompressPdf })));
const RotatePdf = lazy(() => import('@/components/tools/rotate-pdf').then(m => ({ default: m.RotatePdf })));
const WatermarkPdf = lazy(() => import('@/components/tools/watermark-pdf').then(m => ({ default: m.WatermarkPdf })));
const PageNumbersPdf = lazy(() => import('@/components/tools/page-numbers-pdf').then(m => ({ default: m.PageNumbersPdf })));
const ExtractText = lazy(() => import('@/components/tools/extract-text').then(m => ({ default: m.ExtractText })));
const DeletePages = lazy(() => import('@/components/tools/delete-pages').then(m => ({ default: m.DeletePages })));
const ExtractPages = lazy(() => import('@/components/tools/extract-pages').then(m => ({ default: m.ExtractPages })));
const RearrangePages = lazy(() => import('@/components/tools/rearrange-pages').then(m => ({ default: m.RearrangePages })));
const PdfToImages = lazy(() => import('@/components/tools/pdf-to-images').then(m => ({ default: m.PdfToImages })));
const ImagesToPdf = lazy(() => import('@/components/tools/images-to-pdf').then(m => ({ default: m.ImagesToPdf })));
const AiSummarize = lazy(() => import('@/components/tools/ai-summarize').then(m => ({ default: m.AiSummarize })));
const AiChat = lazy(() => import('@/components/tools/ai-chat').then(m => ({ default: m.AiChat })));
const AiTranslate = lazy(() => import('@/components/tools/ai-translate').then(m => ({ default: m.AiTranslate })));
const ProtectPdf = lazy(() => import('@/components/tools/protect-pdf').then(m => ({ default: m.ProtectPdf })));
const EditText = lazy(() => import('@/components/tools/edit-text').then(m => ({ default: m.EditText })));
const RedactPdf = lazy(() => import('@/components/tools/redact-pdf').then(m => ({ default: m.RedactPdf })));
const AddSignature = lazy(() => import('@/components/tools/add-signature').then(m => ({ default: m.AddSignature })));
const HighlightPdf = lazy(() => import('@/components/tools/highlight-pdf').then(m => ({ default: m.HighlightPdf })));
const AnnotatePdf = lazy(() => import('@/components/tools/annotate-pdf').then(m => ({ default: m.AnnotatePdf })));
const WordToPdf = lazy(() => import('@/components/tools/word-to-pdf').then(m => ({ default: m.WordToPdf })));
const RemovePassword = lazy(() => import('@/components/tools/remove-password').then(m => ({ default: m.RemovePassword })));
const EncryptPdf = lazy(() => import('@/components/tools/encrypt-pdf').then(m => ({ default: m.EncryptPdf })));
const FillForms = lazy(() => import('@/components/tools/fill-forms').then(m => ({ default: m.FillForms })));
const ScanToPdf = lazy(() => import('@/components/tools/scan-to-pdf').then(m => ({ default: m.ScanToPdf })));
const ImageToText = lazy(() => import('@/components/tools/image-to-text').then(m => ({ default: m.ImageToText })));
const AiRewrite = lazy(() => import('@/components/tools/ai-rewrite').then(m => ({ default: m.AiRewrite })));
const AiExtractTables = lazy(() => import('@/components/tools/ai-extract-tables').then(m => ({ default: m.AiExtractTables })));
const PermissionControl = lazy(() => import('@/components/tools/permission-control').then(m => ({ default: m.PermissionControl })));
const AiKeyPoints = lazy(() => import('@/components/tools/ai-key-points').then(m => ({ default: m.AiKeyPoints })));
const EditImages = lazy(() => import('@/components/tools/edit-images').then(m => ({ default: m.EditImages })));

function ToolLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center">
      <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mb-4" />
      <p className="text-muted-foreground text-sm">Loading tool...</p>
    </div>
  );
}

function ToolRenderer({ toolId }: { toolId: string }) {
  const toolMap: Record<string, React.ReactNode> = {
    'merge': <MergePdf />,
    'split': <SplitPdf />,
    'compress': <CompressPdf />,
    'rotate': <RotatePdf />,
    'watermark': <WatermarkPdf />,
    'page-numbers': <PageNumbersPdf />,
    'extract-text': <ExtractText />,
    'delete-pages': <DeletePages />,
    'extract-pages': <ExtractPages />,
    'rearrange': <RearrangePages />,
    'pdf-to-images': <PdfToImages />,
    'images-to-pdf': <ImagesToPdf />,
    'ai-summarize': <AiSummarize />,
    'ai-chat': <AiChat />,
    'ai-translate': <AiTranslate />,
    'password-protect': <ProtectPdf />,
    'edit-text': <EditText />,
    'redact': <RedactPdf />,
    'add-signature': <AddSignature />,
    'highlight': <HighlightPdf />,
    'annotate': <AnnotatePdf />,
    'word-to-pdf': <WordToPdf />,
    'remove-password': <RemovePassword />,
    'encrypt': <EncryptPdf />,
    'fill-forms': <FillForms />,
    'scan-to-pdf': <ScanToPdf />,
    'image-to-text': <ImageToText />,
    'ai-rewrite': <AiRewrite />,
    'ai-extract-tables': <AiExtractTables />,
    'permission-control': <PermissionControl />,
    'ai-key-points': <AiKeyPoints />,
    'edit-images': <EditImages />,
  };

  const content = toolMap[toolId];
  if (!content) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Tool Coming Soon</h2>
        <p className="text-muted-foreground max-w-md">
          This tool is currently under development. Check back soon or try one of our other available tools.
        </p>
        </div>
    );
  }

  return <>{content}</>;
}

function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Hero />
      <StatsBanner />
      <ToolsGrid />
      <Testimonials />
      <Features />
      <Pricing />
      <FAQ />
      <CTASection />
    </motion.div>
  );
}

function AllToolsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="py-8"
    >
      <ToolsGrid />
    </motion.div>
  );
}

function PricingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="py-8"
    >
      <Pricing />
    </motion.div>
  );
}

function ViewRouter() {
  const { view, activeToolId } = useAppStore();

  let content: React.ReactNode = null;
  let key = view;

  if (view === 'landing') {
    key = 'landing';
    content = <LandingPage />;
  } else if (view === 'tool' && activeToolId) {
    key = `tool-${activeToolId}`;
    content = (
      <Suspense fallback={<ToolLoading />}>
        <ToolRenderer toolId={activeToolId} />
      </Suspense>
    );
  } else if (view === 'all-tools') {
    key = 'all-tools';
    content = <AllToolsPage />;
  } else if (view === 'pricing') {
    key = 'pricing';
    content = <PricingPage />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ViewRouter />
      </main>
      <Footer />
    </div>
  );
}