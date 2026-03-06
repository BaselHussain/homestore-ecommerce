'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/framerVariants';
import { adminApi } from '@/lib/api';
import { Tag, Loader2 } from 'lucide-react';

interface CategoryStat {
  name: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Derive categories from analytics endpoint
    adminApi.getAnalytics('90d')
      .then(data => {
        const cats: CategoryStat[] = data.analytics?.categoryData ?? [];
        setCategories(cats.sort((a: CategoryStat, b: CategoryStat) => b.count - a.count));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = categories.reduce((s, c) => s + c.count, 0);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Product distribution by category</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-3">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2 bg-card border border-border rounded-xl">
              <Tag className="w-8 h-8 opacity-40" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            categories.map((cat) => {
              const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
              return (
                <motion.div
                  key={cat.name}
                  variants={staggerItem}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground capitalize">
                        {cat.name.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{cat.count} products</span>
                      <span className="text-sm font-semibold text-foreground w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Note</p>
        <p>Categories are derived from existing products. To add a new category, simply create a product with the new category name in the <a href="/products" className="text-primary underline">Products</a> section.</p>
      </div>
    </div>
  );
}
