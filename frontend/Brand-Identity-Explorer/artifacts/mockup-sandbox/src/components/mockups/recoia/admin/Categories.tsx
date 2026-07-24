import React, { useEffect, useMemo, useState } from 'react';
import { Search, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type CatalogItem } from '@/lib/api';

type CategoryStats = {
  category: string;
  count: number;
  withImage: number;
  avgPrice: number | null;
  avgRating: number | null;
};

export function CategoriesPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getCatalog(5000)
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load categories.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo<CategoryStats[]>(() => {
    const byCategory = new Map<string, CatalogItem[]>();
    items.forEach((item) => {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    });

    return Array.from(byCategory.entries())
      .map(([category, list]) => {
        const prices = list.map((i) => i.price).filter((p): p is number => p !== null);
        const ratings = list.map((i) => i.avg_rating).filter((r): r is number => r !== null);
        return {
          category,
          count: list.length,
          withImage: list.filter((i) => i.has_image).length,
          avgPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
          avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const visible = stats.filter((s) => s.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Categories" breadcrumb="Data / Categories">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">Total Categories</span>
            <span className="text-2xl font-bold text-slate-900">{stats.length}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">Total Products</span>
            <span className="text-2xl font-bold text-slate-900">{items.length}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">Largest Category</span>
            <span className="text-2xl font-bold text-slate-900">{stats[0]?.category ?? '—'}</span>
          </div>
        </div>

        <div className="flex items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search categories…" className="pl-9 bg-slate-50" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Products</th>
                  <th className="px-6 py-4 font-medium">Avg Price</th>
                  <th className="px-6 py-4 font-medium">Avg Rating</th>
                  <th className="px-6 py-4 font-medium">With Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && <tr><td className="px-6 py-4 text-slate-500" colSpan={5}>Loading categories…</td></tr>}
                {!loading && visible.map((s) => (
                  <tr key={s.category} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <Tag className="w-4 h-4 text-blue-600" /> {s.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.count}</td>
                    <td className="px-6 py-4 text-slate-600">{s.avgPrice !== null ? `$${s.avgPrice.toFixed(2)}` : '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{s.avgRating !== null ? s.avgRating.toFixed(2) : '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{s.withImage} / {s.count}</td>
                  </tr>
                ))}
                {!loading && visible.length === 0 && (
                  <tr><td className="px-6 py-4 text-slate-500" colSpan={5}>No categories match this search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
