import React, { useEffect, useState } from 'react';
import { AppLayout } from './_shared/Layout';
import { Heart } from 'lucide-react';
import { api, ApiError, type CatalogItem } from '@/lib/api';
import { ProductCard } from './Home';

export function Favorites() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getFavorites();
        if (!cancelled) setItems(res.items);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to reach the RecoIA API.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function removeFavorite(itemId: string): Promise<void> {
    setItems((current) => current.filter((item) => item.item_id !== itemId));
    try {
      await api.removeFavorite(itemId);
    } catch {
      // best-effort; UI state already reflects the user's action
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-12 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
              My Favorites
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {items.length} saved item{items.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {error && (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="font-semibold">The frontend could not connect to the backend.</p>
            <p className="mt-1 text-sm">{error}. Start the FastAPI service on port 8000, then refresh this page.</p>
          </section>
        )}

        {loading ? (
          <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading favorites…</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">You haven't saved anything yet.</p>
            <p className="text-slate-400 text-sm mt-1">Tap the heart icon on any product to add it here.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ProductCard
                key={item.item_id}
                item={item}
                saved
                onToggleSave={() => removeFavorite(item.item_id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
