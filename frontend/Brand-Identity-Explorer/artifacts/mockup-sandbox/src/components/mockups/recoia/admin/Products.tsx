import React, { useEffect, useMemo, useState } from 'react';
import { Search, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type CatalogItem } from '@/lib/api';

export function ProductsPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getCatalog(100)
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);

  const visible = items.filter((item) => {
    const matchesSearch = [item.title, item.brand].some((v) => v.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const withImages = items.filter((i) => i.has_image).length;

  return (
    <AdminLayout title="Products">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">Loaded Sample</span>
            <span className="text-2xl font-bold text-slate-900">{items.length}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">With Images</span>
            <span className="text-2xl font-bold text-green-600">{withImages}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">Categories</span>
            <span className="text-2xl font-bold text-slate-900">{categories.length}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search products…" className="pl-9 bg-slate-50" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48 bg-slate-50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>}

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">Product Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Brand</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && <tr><td className="px-6 py-4 text-slate-500" colSpan={6}>Loading products…</td></tr>}
                {!loading && visible.map((item) => (
                  <tr key={item.item_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
                          {item.has_image && item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <p className="font-medium text-slate-900 truncate max-w-[240px]">{item.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.category}</td>
                    <td className="px-6 py-4 text-slate-600">{item.brand}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.price === null ? '—' : `$${item.price.toFixed(2)}`}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.avg_rating !== null ? (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500 font-bold">★</span>
                          <span className="font-medium text-slate-900">{item.avg_rating.toFixed(1)}</span>
                          <span className="text-slate-400 text-xs">({item.n_ratings})</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`${item.has_image ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'} border-none`}>
                        {item.has_image ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {!loading && visible.length === 0 && (
                  <tr><td className="px-6 py-4 text-slate-500" colSpan={6}>No products match this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
