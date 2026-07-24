import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from './_shared/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, Sparkles } from 'lucide-react';
import { api, ApiError, type CatalogItem } from '@/lib/api';
import { ProductCard } from './Home';

const PAGE_SIZE = 24;
const DISCOVER_COUNT = 6;

function dominantCategory(items: CatalogItem[]): string | null {
  if (items.length === 0) return null;
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("relevance");

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [discoverItems, setDiscoverItems] = useState<CatalogItem[]>([]);
  const [discoverSource, setDiscoverSource] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(() => new Set());
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCatalog(200).then((res) => {
      setAllCategories(Array.from(new Set(res.items.map((i) => i.category))).sort());
      setAllBrands(Array.from(new Set(res.items.map((i) => i.brand))).sort());
    }).catch(() => {
      // best-effort; filters just stay empty if this fails
    });
    api.getFavorites().then((res) => {
      setSavedItems(new Set(res.items.map((i) => i.item_id)));
    }).catch(() => {
      // best-effort
    });
  }, []);

  const filters = useMemo(
    () => ({
      q: q.trim() || undefined,
      category: category || undefined,
      brand: brand || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      sort,
    }),
    [q, category, brand, minPrice, maxPrice, sort],
  );

  async function runSearch(offset: number, append: boolean): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await api.searchCatalog({ ...filters, limit: PAGE_SIZE, offset });
      setItems((current) => (append ? [...current, ...res.items] : res.items));
      setTotal(res.total);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to reach the RecoIA API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void runSearch(0, false);
    setSearchParams(q ? { q } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // While actively searching, surface a handful of real, personalized picks
  // from OTHER categories the user has shown genuine interest in -- a
  // "beauty searcher looking for earrings" also sees makeup, etc.
  useEffect(() => {
    const excludeCategory = category || dominantCategory(items);
    if (!q.trim() && !category) {
      setDiscoverItems([]);
      return;
    }
    if (!excludeCategory) {
      setDiscoverItems([]);
      return;
    }
    let cancelled = false;
    api
      .getRecommendations(DISCOVER_COUNT, [], [excludeCategory])
      .then((res) => {
        if (cancelled) return;
        setDiscoverItems(res.items);
        setDiscoverSource(res.source);
      })
      .catch(() => {
        if (!cancelled) setDiscoverItems([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, category, q]);

  async function toggleSaved(item: CatalogItem): Promise<void> {
    const nowSaved = !savedItems.has(item.item_id);
    setSavedItems((current) => {
      const next = new Set(current);
      if (nowSaved) next.add(item.item_id);
      else next.delete(item.item_id);
      return next;
    });
    try {
      if (nowSaved) await api.addFavorite(item.item_id);
      else await api.removeFavorite(item.item_id);
    } catch {
      // best-effort; UI state already reflects the user's action
    }
  }

  const canLoadMore = total !== null && items.length < total;

  return (
    <AppLayout>
      <div className="space-y-8 pb-12 max-w-[1400px] mx-auto">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Search the Catalog</h1>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title or brand…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-11 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
              <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {allCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={brand || "all"} onValueChange={(v) => setBrand(v === "all" ? "" : v)}>
              <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {allBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-slate-50"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-slate-50"
            />

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="font-semibold">The frontend could not connect to the backend.</p>
            <p className="mt-1 text-sm">{error}. Start the FastAPI service on port 8000, then refresh this page.</p>
          </section>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {total !== null ? `${total} result${total === 1 ? "" : "s"}` : "Results"}
            </h2>
          </div>

          {loading && items.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">Searching…</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-slate-200">
              <p className="text-slate-500 font-medium">No products match these filters.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <ProductCard
                    key={item.item_id}
                    item={item}
                    saved={savedItems.has(item.item_id)}
                    onToggleSave={() => toggleSaved(item)}
                  />
                ))}
              </div>
              {canLoadMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => runSearch(items.length, true)}
                    className="rounded-full px-8"
                  >
                    {loading ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {discoverItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-blue-100 p-1.5 rounded-lg"><Sparkles className="w-4 h-4 text-blue-600" /></div>
              <h2 className="text-xl font-bold text-slate-900">
                {discoverSource === "item_item_personalized" ? "You Might Also Like" : "Discover More"}
              </h2>
            </div>
            <p className="text-sm text-slate-500 mb-6 ml-9">
              {discoverSource === "item_item_personalized"
                ? "Based on your activity, from categories outside this search."
                : "Popular picks from other categories."}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {discoverItems.map((item) => (
                <ProductCard
                  key={item.item_id}
                  item={item}
                  saved={savedItems.has(item.item_id)}
                  onToggleSave={() => toggleSaved(item)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
