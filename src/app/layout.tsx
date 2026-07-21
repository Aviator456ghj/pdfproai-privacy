import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pdfproai-privacy.vercel.app'),
  title: {
    default: 'PDFPro AI - Free Online PDF Merger, Compressor & AI Tools',
    template: '%s | PDFPro AI',
  },
  description: 'Every PDF tool you will ever need, powered by AI. Merge, compress, convert, edit, and translate documents instantly in your browser with no installation required.',
  keywords: [
    'free pdf compressor',
    'merge pdf online',
    'ai pdf summarizer',
    'convert pdf to word free',
    'online pdf tools no sign up',
    'compress pdf under 10mb',
  ],
  authors: [{ name: 'PDFPro AI' }],
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'PDFPro AI - The AI-Powered PDF Platform',
    description: 'Merge, compress, convert, edit & transform your documents in seconds for free.',
    url: 'https://pdfproai-privacy.vercel.app',
    siteName: 'PDFPro AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFPro AI - Free Online PDF Platform',
    description: 'Merge, compress, convert, and edit PDFs with cutting-edge AI.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://pl30459970.effectivecpmnetwork.com/7b/69/98/7b69984a1d130e6525ae8011d51bfa4d.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Script
            id="adsterra-banner-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.atOptions = {
                  key: '2e6ebff6925ac04d14216c39f38d7f85',
                  format: 'iframe',
                  height: 60,
                  width: 468,
                  params: {}
                };
              `,
            }}
          />
          <Script
            src="https://www.highperformanceformat.com/2e6ebff6925ac04d14216c39f38d7f85/invoke.js"
            strategy="afterInteractive"
          />
          <a
            href="https://www.effectivecpmnetwork.com/xt328n73?key=e4902d0466b8f9259aa7fcd9646a8cb6"
            target="_blank"
            rel="noopener noreferrer"
            className="sr-only"
          >
            Sponsored link
          </a>
          <Script
            src="https://pl30459974.effectivecpmnetwork.com/59/42/d5/5942d5b343a1892947057c0272bf3b31.js"
            strategy="afterInteractive"
          />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}