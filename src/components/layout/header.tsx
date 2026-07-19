'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Sparkles, ChevronDown, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { categories, getAllTools } from '@/lib/tools';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const { theme, setTheme } = useTheme();
  const { goHome, openTool, openCategory, setSearchQuery } = useAppStore();

  const filteredTools = searchVal.length > 1
    ? getAllTools().filter(t =>
        t.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        t.description.toLowerCase().includes(searchVal.toLowerCase())
      )
    : [];

  const handleSearch = (val: string) => {
    setSearchVal(val);
    setSearchQuery(val);
  };

  const handleSearchSelect = (toolId: string) => {
    setSearchOpen(false);
    setSearchVal('');
    setSearchQuery('');
    openTool(toolId);
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={goHome} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
              <span className="text-white font-bold text-sm">PDF</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                PDFPro
              </span>
              <span className="text-[10px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">
                AI
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => openCategory(cat.id)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
              >
                {cat.name}
              </button>
            ))}
            <div className="relative ml-1 group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all">
                More <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border bg-popover p-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {categories.slice(5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => openCategory(cat.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border bg-background shadow-2xl p-3 z-50"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search 100+ PDF tools..."
                        value={searchVal}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-xl border bg-muted/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    {filteredTools.length > 0 && (
                      <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border bg-popover">
                        {filteredTools.slice(0, 10).map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => handleSearchSelect(tool.id)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            <tool.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="text-left">
                              <div className="text-sm font-medium">{tool.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{tool.description}</div>
                            </div>
                            {tool.isAI && (
                              <Sparkles className="h-3.5 w-3.5 text-amber-500 ml-auto shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {searchVal.length > 1 && filteredTools.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No tools found</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button variant="ghost" size="sm" className="hidden sm:flex">
              Log In
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              Get Premium
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t"
            >
              <div className="px-4 py-3 space-y-1 bg-background">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { openCategory(cat.id); setMobileOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <cat.icon className="h-4 w-4" />
                    {cat.name}
                    <span className="ml-auto text-xs text-muted-foreground">{cat.tools.length} tools</span>
                  </button>
                ))}
                <div className="pt-2 flex gap-2">
                  <Button variant="outline" className="flex-1">Log In</Button>
                  <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">Get Premium</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}