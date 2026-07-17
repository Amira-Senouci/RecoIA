import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Heart,
  RefreshCw,
  Search,
  Server,
  Sparkles,
  Star,
} from "lucide-react";

import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

type CatalogItem = {
  item_id: string;
  title: string;
  brand: string;
  category: string;
  price: number | null;
  image_url: string;
  has_image: boolean;
  avg_rating: number | null;
  n_ratings: number;
};

type Health = { status: string; version: string };
type RecommendationResponse = {
  source: string;
  version: string;
  items: CatalogItem[];
};

function resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const functions = Object.values(mod).filter(
    (value) => typeof value === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    functions.at(-1)
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const module = await loader();
        if (cancelled) return;
        const name = componentPath.split("/").at(-1) ?? "Preview";
        const component = resolveComponent(module, name);
        if (!component) {
          setError(`No exported React component found in ${componentPath}.tsx`);
          return;
        }
        setComponent(() => component);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      }
    }

    void loadComponent();
    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return <pre className="p-8 text-red-700">{error}</pre>;
  }
  return Component ? <Component /> : null;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

function formatPrice(price: number | null): string {
  return price === null
    ? "Price unavailable"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function ProductCard({
  item,
  saved,
  onSave,
}: {
  item: CatalogItem;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square bg-slate-100">
        {item.has_image && item.image_url ? (
          <img
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
            src={item.image_url}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-slate-100 text-5xl font-bold text-blue-300">
            {item.title.slice(0, 1).toUpperCase()}
          </div>
        )}
        <button
          aria-label={`Save ${item.title}`}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur hover:text-rose-600"
          onClick={onSave}
          type="button"
        >
          <Heart className={saved ? "h-4 w-4 fill-rose-500 text-rose-500" : "h-4 w-4"} />
        </button>
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{item.category}</p>
        <h2 className="line-clamp-2 min-h-10 font-semibold text-slate-900">{item.title}</h2>
        <p className="truncate text-sm text-slate-500">{item.brand}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-bold text-slate-900">{formatPrice(item.price)}</span>
          {item.avg_rating !== null && (
            <span className="flex items-center gap-1 text-sm font-medium text-slate-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {item.avg_rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">{item.n_ratings.toLocaleString()} ratings</p>
      </div>
    </article>
  );
}

function RecoiaDashboard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [recommendations, setRecommendations] = useState<CatalogItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [savedItems, setSavedItems] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard(exclusions = savedItems): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "12" });
      exclusions.forEach((itemId) => params.append("exclude_item", itemId));
      const [nextHealth, nextRecommendations, nextCatalog] = await Promise.all([
        getJson<Health>("/api/health"),
        getJson<RecommendationResponse>(`/api/recommendations?${params.toString()}`),
        getJson<{ items: CatalogItem[] }>("/api/catalog?limit=12"),
      ]);
      setHealth(nextHealth);
      setRecommendations(nextRecommendations.items);
      setCatalog(nextCatalog.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reach the RecoIA API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const visibleCatalog = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return catalog;
    return catalog.filter((item) =>
      [item.title, item.brand, item.category].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }, [catalog, query]);

  function toggleSaved(itemId: string): void {
    setSavedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white shadow-sm"><Sparkles className="h-5 w-5" /></div>
            <div>
              <p className="text-lg font-bold">RecoIA</p>
              <p className="text-sm text-slate-500">Recommendation workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${health ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              <Server className="h-4 w-4" />
              {health ? `API connected · ${health.version}` : "Checking API"}
            </span>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              onClick={() => void loadDashboard()}
              type="button"
            >
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl sm:p-12">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-100"><Sparkles className="h-4 w-4" /> Live recommendation API</p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Discover products from your real RecoIA catalog.</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">These cards are loaded from the FastAPI backend and ranked using the processed Amazon Reviews interactions.</p>
        </section>

        {error && (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="font-semibold">The frontend could not connect to the backend.</p>
            <p className="mt-1 text-sm">{error}. Start the FastAPI service on port 8000, then refresh this page.</p>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">For you</p>
              <h2 className="text-2xl font-bold">Popular picks with images</h2>
            </div>
            <p className="text-sm text-slate-500">Save a card and refresh to exclude it from the next request.</p>
          </div>
          {loading ? (
            <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading recommendations…</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommendations.map((item) => <ProductCard item={item} key={item.item_id} saved={savedItems.has(item.item_id)} onSave={() => toggleSaved(item.item_id)} />)}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Catalog</p>
              <h2 className="text-2xl font-bold">Browse top-rated items</h2>
            </div>
            <label className="relative block sm:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none ring-blue-500 focus:ring-2" onChange={(event) => setQuery(event.target.value)} placeholder="Search title, brand, category" type="search" value={query} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCatalog.map((item) => <ProductCard item={item} key={item.item_id} saved={savedItems.has(item.item_id)} onSave={() => toggleSaved(item.item_id)} />)}
          </div>
          {!loading && visibleCatalog.length === 0 && <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">No catalog items match that search.</p>}
        </section>
      </div>
    </main>
  );
}

function getPreviewPath(): string | null {
  const match = window.location.pathname.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

export default function App() {
  const previewPath = getPreviewPath();
  return previewPath ? <PreviewRenderer componentPath={previewPath} modules={discoveredModules} /> : <RecoiaDashboard />;
}
