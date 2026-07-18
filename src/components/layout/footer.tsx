'use client';

import { useAppStore } from '@/lib/store';
import { categories, getAllTools } from '@/lib/tools';
import { Github, Twitter, Mail, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const { openCategory, openTool } = useAppStore();
  const toolCount = getAllTools().length;

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <button onClick={() => useAppStore.getState().goHome()} className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <span className="text-white font-bold text-xs">PDF</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">PDFPro</span>
                <span className="text-[9px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">AI</span>
              </div>
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The most complete AI-powered PDF platform. {toolCount}+ tools to handle every PDF task.
            </p>
          </div>

          {/* Tool Categories */}
          {categories.slice(0, 4).map((cat) => (
            <div key={cat.id}>
              <h4 className="font-semibold text-sm mb-3">{cat.name}</h4>
              <ul className="space-y-2">
                {cat.tools.slice(0, 5).map((tool) => (
                  <li key={tool.id}>
                    <button
                      onClick={() => openTool(tool.id)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.name}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => openCategory(cat.id)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PDFPro AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for productivity
          </p>
        </div>
      </div>
    </footer>
  );
}