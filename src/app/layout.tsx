import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDFPro AI - The Most Complete AI-Powered PDF Platform | 100+ Tools",
  description: "Merge, split, compress, convert, edit, and AI-analyze your PDFs. 100+ free and premium tools in one platform. No signup required.",
  keywords: ["PDF", "PDF tools", "merge PDF", "split PDF", "compress PDF", "PDF to Word", "AI PDF", "PDF editor", "online PDF"],
  authors: [{ name: "PDFPro AI" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "PDFPro AI - 100+ PDF Tools, One Platform",
    description: "The most complete AI-powered PDF platform. Every tool you'll ever need.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}