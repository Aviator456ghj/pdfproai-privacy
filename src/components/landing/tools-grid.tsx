'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
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

function ToolCard({ tool, category }: { tool: Tool; category: ToolCategory }) {
  const { openTool } = useAppStore();
  const Icon = tool.icon;

  return (
    <motion.button
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => openTool(tool.id)}
      className="group relative flex flex-col items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md hover:border-slate-300/80 cursor-pointer w-full"
    >
      {/* Badges row */}
      <div className="flex items-center gap-1.5 self-end">
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
      <div className={`flex size-10 items-center justify-center rounded-lg ${category.bgColor} ${category.color}`}>
        <Icon className="size-5" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-700 transition-colors truncate">
          {tool.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
        Open <ArrowRight className="size-3" />
      </div>
    </motion.button>
  );
}

function CategorySection({
  category,
  filteredTools,
}: {
  category: ToolCategory;
  filteredTools: Tool[];
}) {
  const CatIcon = category.icon;

  return (
    <motion.section
      id={`category-${category.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      {/* Category header */}
      <div className="mb-5 flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${category.bgColor} ${category.color}`}>
          <CatIcon className="size-4.5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
          <p className="text-xs text-muted-foreground">{category.description}</p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
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
          <ToolCard key={tool.id} tool={tool} category={category} />
        ))}
      </motion.div>
    </motion.section>
  );
}

export function ToolsGrid() {
  const { searchQuery, activeCategoryId } = useAppStore();

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

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Explore All {totalTools} Tools
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            From basic operations to AI-powered intelligence — find the perfect tool for your PDF needs.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="space-y-14">
          {displayedCategories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              filteredTools={cat.filteredTools}
            />
          ))}
        </div>

        {/* Empty state */}
        {displayedCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <Sparkles className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No tools found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query to find what you&apos;re looking for.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}