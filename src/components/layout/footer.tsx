'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { categories } from '@/lib/tools';
import {
  Mail,
  Heart,
  Globe,
  Send,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const socialLinks = [
  { icon: () => (
    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ), href: '#', label: 'Twitter' },
  { icon: () => (
    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  ), href: '#', label: 'GitHub' },
  { icon: Mail, href: 'mailto:support@pdfpro.ai', label: 'Email' },
];

export function Footer() {
  const { openCategory, setShowPrivacyPolicy, setShowTermsOfService } = useAppStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmail('');
    }
  };

  return (
    <footer className="relative mt-auto">
      {/* Gradient top border */}
      <div className="h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

      <div className="bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          {/* Top section: Logo + Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
            {/* Logo + Tagline - spans 2 cols */}
            <div className="col-span-2 mb-2 lg:mb-0">
              <button
                onClick={() => useAppStore.getState().goHome()}
                className="flex items-center gap-2.5 mb-4 group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <span className="text-white font-bold text-xs">PDF</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    PDFPro
                  </span>
                  <span className="text-[9px] font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">
                    AI
                  </span>
                </div>
              </button>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
                The most complete AI-powered PDF platform. Secure, fast, and free to get started.
              </p>

              {/* Social links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex items-center justify-center size-9 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200"
                  >
                    <social.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Products column */}
            <div>
              <h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
                Products
              </h4>
              <ul className="space-y-2.5">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => openCategory(cat.id)}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-1"
                    >
                      {cat.name}
                      <ArrowUpRight className="size-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
                Company
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="mailto:support@pdfpro.ai"
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-1.5"
                  >
                    <Mail className="size-3" />
                    Contact Support
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@pdfpro.ai"
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowTermsOfService(true)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="mt-12 pt-8 border-t border-white/[0.06]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-sm">
                <h4 className="font-semibold text-sm text-white mb-1">
                  Stay up to date
                </h4>
                <p className="text-sm text-slate-500">
                  Get the latest updates, tips, and product news.
                </p>
              </div>
              <form
                onSubmit={handleSubscribe}
                className="flex w-full md:w-auto gap-2"
              >
                <div className="relative flex-1 md:w-64">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 pl-10 bg-white/5 border-white/10 text-sm text-white placeholder:text-slate-500 rounded-lg focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="h-10 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium shrink-0"
                >
                  <Send className="size-3.5 mr-1.5" />
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} PDFPro AI. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              {/* Language selector */}
              <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200">
                <Globe className="size-3.5" />
                <span>English</span>
              </button>

              <div className="h-3 w-px bg-white/10" />

              <p className="text-xs text-slate-500 flex items-center gap-1">
                Made with{' '}
                <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for
                productivity
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}