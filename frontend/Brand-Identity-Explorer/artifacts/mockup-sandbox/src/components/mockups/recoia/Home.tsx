import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from './_shared/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, Sparkles, ChevronRight, TrendingUp, History } from 'lucide-react';
import { api, ApiError, type CatalogItem } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export function ProductCard({
  item,
  saved,
  onToggleSave,
}: {
  item: CatalogItem;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <Card className="min-w-[260px] max-w-[260px] bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative h-52 bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
        {item.has_image && item.image_url ? (
          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center text-4xl font-bold text-slate-300 shadow-inner">
            {item.brand.charAt(0)}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSave}
          className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm hover:bg-white rounded-full h-8 w-8 text-slate-500 hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart className={saved ? "h-4 w-4 fill-rose-500 text-rose-500" : "h-4 w-4"} />
        </Button>
      </div>
      <CardContent className="p-4 flex flex-col h-[180px]">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{item.brand}</div>
        <h3 className="font-semibold text-slate-900 leading-tight mb-2 h-10 line-clamp-2 text-sm">
          {item.title}
        </h3>
        <div className="flex items-center gap-1 mb-auto">
          {item.avg_rating !== null && (
            <>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-slate-700">{item.avg_rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({item.n_ratings})</span>
            </>
          )}
        </div>
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="font-bold text-lg text-slate-900 leading-none">
            {item.price === null ? "—" : `$${item.price.toFixed(2)}`}
          </div>
          <Link to={`/product/${item.item_id}`}>
            <Button size="sm" className="bg-slate-900 hover:bg-blue-600 text-white rounded-lg px-4 h-8 transition-colors">
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function Home() {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [recommendations, setRecommendations] = useState<CatalogItem[]>([]);
  const [trending, setTrending] = useState<CatalogItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CatalogItem[]>([]);
  const [savedItems, setSavedItems] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const [catalogRes, recoRes, favoritesRes, trendingRes, recentRes] = await Promise.all([
          api.getCatalog(24),
          api.getRecommendations(8),
          api.getFavorites(),
          api.getTrending(8),
          api.getRecentlyViewed(8),
        ]);
        if (cancelled) return;
        setCatalog(catalogRes.items);
        setRecommendations(recoRes.items);
        setSavedItems(new Set(favoritesRes.items.map((item) => item.item_id)));
        setTrending(trendingRes.items);
        setRecentlyViewed(recentRes.items);
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

  const categories = useMemo(
    () => Array.from(new Set(catalog.map((item) => item.category))).slice(0, 8),
    [catalog],
  );
  const brands = useMemo(
    () => Array.from(new Set(catalog.map((item) => item.brand))).slice(0, 6),
    [catalog],
  );

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

  return (
    <AppLayout>
      <div className="space-y-12 pb-12 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Good morning, {user?.email.split('@')[0] ?? 'there'} 👋</h1>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1.5 text-sm font-semibold rounded-full w-fit shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            {recommendations.length} new recommendations
          </Badge>
        </div>

        {error && (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="font-semibold">The frontend could not connect to the backend.</p>
            <p className="mt-1 text-sm">{error}. Start the FastAPI service on port 8000, then refresh this page.</p>
          </section>
        )}

        {/* Personalized AI Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
              <div className="bg-blue-100 p-1.5 rounded-lg"><Sparkles className="w-5 h-5 text-blue-600" /></div>
              Top Picks For You
            </h2>
          </div>
          {loading ? (
            <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading recommendations…</p>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {recommendations.map(item => (
                <div key={item.item_id} className="snap-start shrink-0">
                  <ProductCard item={item} saved={savedItems.has(item.item_id)} onToggleSave={() => toggleSaved(item)} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 mb-6">
              <div className="bg-blue-100 p-1.5 rounded-lg"><History className="w-5 h-5 text-blue-600" /></div>
              Recently Viewed
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {recentlyViewed.map(item => (
                <div key={item.item_id} className="snap-start shrink-0">
                  <ProductCard item={item} saved={savedItems.has(item.item_id)} onToggleSave={() => toggleSaved(item)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 mb-6">
              <div className="bg-blue-100 p-1.5 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
              Trending This Week
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {trending.map(item => (
                <div key={item.item_id} className="snap-start shrink-0">
                  <ProductCard item={item} saved={savedItems.has(item.item_id)} onToggleSave={() => toggleSaved(item)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6 text-slate-900">Explore Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/search?category=${encodeURIComponent(cat)}`}
                  className="flex flex-col items-center justify-center p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-700 text-center">{cat}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popular Brands */}
        {brands.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Popular Brands</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {brands.map(brand => (
                <Link
                  key={brand}
                  to={`/search?brand=${encodeURIComponent(brand)}`}
                  className="min-w-[160px] h-24 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-bold text-lg text-slate-500 shrink-0 px-3 text-center hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Catalog */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Browse the Catalog</h2>
            <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
              {catalog.length} items <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          {loading ? (
            <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading catalog…</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalog.map(item => (
                <ProductCard key={item.item_id} item={item} saved={savedItems.has(item.item_id)} onToggleSave={() => toggleSaved(item)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
