'use client';

import { useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, SearchX, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { categories, type Tool, type ToolCategory } from '@/lib/tools';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/** Map category id → tailwind border-left accent color */
const categoryBorderAccent: Record<string, string> = {
  essentials: 'border-l-emerald-400',
  conversion: 'border-l-violet-400',
  ocr: 'border-l-amber-400',
  ai: 'border-l-rose-400',
  editing: 'border-l-cyan-400',
  security: 'border-l-slate-400',
  developer: 'border-l-orange-400',
};

/** Highlight matched text in a string */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-100 text-emerald-800 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function ToolCard({ tool, category, searchQuery }: { tool: Tool; category: ToolCategory; searchQuery: string }) {
  const { openTool, setSearchQuery, activeCategoryId, setView } = useAppStore();
  const Icon = tool.icon;
  const borderAccent = categoryBorderAccent[category.id] ?? 'border-l-slate-300';

  return (
    <motion.button
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => openTool(tool.id)}
      className={`group relative flex flex-col items-start gap-3 rounded-xl border border-slate-200/80 border-l-[3px] ${borderAccent} bg-gradient-to-b from-white to-slate-50/80 p-5 text-left shadow-sm hover:shadow-lg hover:border-slate-300/80 cursor-pointer w-full transition-all duration-200 overflow-hidden`}
    >
      {/* Gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-emerald-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Badges row */}
      <div className="relative flex items-center gap-1.5 self-end">
        {tool.isAI && (
          <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 gap-0.5">
            <Sparkles className="size-2.5" />
            AI
          </Badge>
        )}
        {tool.isNew && (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
            NEW
          </Badge>
        )}
        {tool.isPremium && !tool.isNew && !tool.isAI && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            PRO
          </Badge>
        )}
        {!tool.isPremium && !tool.isNew && !tool.isAI && (
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-[10px] px-1.5 py-0 bg-emerald-50/50">
            Free
          </Badge>
        )}
      </div>

      {/* Icon */}
      <div className={`relative flex size-11 items-center justify-center rounded-lg shadow-sm ${category.bgColor} ${category.color} group-hover:shadow-md transition-shadow duration-200`}>
        <Icon className="size-5" />
      </div>

      {/* Text */}
      <div className="relative flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-700 transition-colors truncate">
          <HighlightText text={tool.name} query={searchQuery} />
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          <HighlightText text={tool.description} query={searchQuery} />
        </p>
      </div>

      {/* Arrow indicator — always visible, opacity increases on hover */}
      <div className="relative flex items-center gap-1 text-xs font-medium text-emerald-600 opacity-40 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
        Open <ArrowRight className="size-3" />
      </div>
    </motion.button>
  );
}

function CategorySection({
  category,
  filteredTools,
  searchQuery,
  sectionIndex,
}: {
  category: ToolCategory;
  filteredTools: Tool[];
  searchQuery: string;
  sectionIndex: number;
}) {
  const CatIcon = category.icon;
  const isEven = sectionIndex % 2 === 0;

  return (
    <motion.section
      id={`category-${category.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className={`scroll-mt-24 rounded-2xl p-5 sm:p-6 ${isEven ? 'bg-white' : 'bg-slate-50/70'}`}
    >
      {/* Category header */}
      <div className="mb-5 flex items-start sm:items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${category.bgColor} ${category.color} shrink-0`}>
          <CatIcon className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
          {/* Gradient line below header */}
          <div className="mt-2 h-[2px] w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>
        <Badge variant="secondary" className="ml-auto text-xs shrink-0">
          {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Tools grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
      >
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} category={category} searchQuery={searchQuery} />
        ))}
      </motion.div>
    </motion.section>
  );
}

export function ToolsGrid() {
  const { searchQuery, activeCategoryId, setSearchQuery, setView, setActiveCategoryId } = useAppStore();

  const displayedCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return categories
      .map((cat) => {
        const tools = cat.tools.filter((tool) => {
          const matchesCategory = !activeCategoryId || cat.id === activeCategoryId;
          const matchesSearch =
            !query ||
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query);
          return matchesCategory && matchesSearch;
        });
        return { ...cat, filteredTools: tools };
      })
      .filter((cat) => cat.filteredTools.length > 0);
  }, [searchQuery, activeCategoryId]);

  const totalTools = useMemo(
    () => displayedCategories.reduce((sum, cat) => sum + cat.filteredTools.length, 0),
    [displayedCategories]
  );

  const isSearchActive = searchQuery.trim().length > 0;

  const handleBrowseAll = () => {
    setSearchQuery('');
    setActiveCategoryId(null);
    setView('landing');
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header with decorative element */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Decorative dot pattern + gradient line */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <span className="size-1 rounded-full bg-emerald-400" />
            <span className="size-1 rounded-full bg-emerald-300" />
            <span className="size-1 rounded-full bg-teal-400" />
            <span className="h-[2px] w-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
            <span className="size-1 rounded-full bg-teal-400" />
            <span className="size-1 rounded-full bg-teal-300" />
            <span className="size-1 rounded-full bg-teal-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Explore All {totalTools} Tools
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-base">
            From basic operations like merge and split, to AI-powered summarization and translation —
            find the perfect tool for every PDF task. All tools run securely in your browser.
          </p>
        </motion.div>

        {/* Search results message */}
        <AnimatePresence>
          {isSearchActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3"
            >
              <p className="text-sm text-emerald-800">
                Showing <span className="font-semibold">{totalTools}</span> result{totalTools !== 1 ? 's' : ''} for{' '}
                <span className="font-semibold">&ldquo;{searchQuery.trim()}&rdquo;</span>
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/60 shrink-0 h-7 px-2 text-xs"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="space-y-6">
          {displayedCategories.map((cat, i) => (
            <CategorySection
              key={cat.id}
              category={cat}
              filteredTools={cat.filteredTools}
              searchQuery={searchQuery}
              sectionIndex={i}
            />
          ))}
        </div>

        {/* Empty state */}
        <AnimatePresence>
          {displayedCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              {/* Larger illustration area */}
              <div className="relative mb-6">
                <div className="flex size-24 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                  <SearchX className="size-12" />
                </div>
                <div className="absolute -top-1 -right-1 flex size-8 items-center justify-center rounded-full bg-emerald-100">
                  <Sparkles className="size-4 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground">No tools found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                We couldn&apos;t find any tools matching your search. Try a different query or browse all available tools.
              </p>
              <Button
                variant="outline"
                className="mt-6 gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={handleBrowseAll}
              >
                <LayoutGrid className="size-4" />
                Browse All Tools
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}