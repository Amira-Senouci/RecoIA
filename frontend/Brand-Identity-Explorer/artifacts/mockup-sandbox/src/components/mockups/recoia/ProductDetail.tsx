import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from './_shared/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Star, Heart, Share, ShieldCheck, Truck, RotateCcw, Network, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { api, ApiError, type CatalogItem } from '@/lib/api';

function MiniProductCard({ item }: { item: CatalogItem }) {
  return (
    <Link to={`/product/${item.item_id}`}>
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer">
        <div className="relative h-48 bg-slate-100 flex items-center justify-center p-6">
          {item.has_image && item.image_url ? (
            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-3xl font-bold text-slate-300">
              {item.brand.charAt(0)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{item.brand}</div>
          <h4 className="font-semibold text-slate-900 leading-tight mb-2 h-10 line-clamp-2 text-sm">
            {item.title}
          </h4>
          {item.avg_rating !== null && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-slate-700">{item.avg_rating.toFixed(1)}</span>
            </div>
          )}
          <div className="font-bold text-lg text-slate-900 leading-none">
            {item.price === null ? "—" : `$${item.price.toFixed(2)}`}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<CatalogItem | null>(null);
  const [related, setRelated] = useState<CatalogItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<"idle" | "placing" | "placed" | "error">("idle");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([api.getItem(id), api.getRecommendations(8, [id]), api.getFavorites()])
      .then(([item, recos, favorites]) => {
        if (cancelled) return;
        setProduct(item);
        setRelated(recos.items);
        setSaved(favorites.items.some((favorite) => favorite.item_id === id));
        void api.postEvent(id, "view");
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load this product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function toggleSave(): Promise<void> {
    if (!id) return;
    const nowSaved = !saved;
    setSaved(nowSaved);
    try {
      if (nowSaved) await api.addFavorite(id);
      else await api.removeFavorite(id);
    } catch {
      // best-effort; UI state already reflects the user's action
    }
  }

  async function placeOrder(): Promise<void> {
    if (!id) return;
    setOrderStatus("placing");
    try {
      await api.createOrder(id, 1);
      setOrderStatus("placed");
    } catch {
      setOrderStatus("error");
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="max-w-6xl mx-auto rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading product…</p>
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-semibold">{error ?? "Product not found."}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/home")}>Back to catalog</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-16">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 mb-8 font-medium">
          <ol className="flex items-center space-x-2">
            <li><Link to="/home" className="hover:text-blue-600 transition-colors">Home</Link></li>
            <li><ChevronRight className="w-4 h-4 text-slate-300" /></li>
            <li>{product.category}</li>
            <li><ChevronRight className="w-4 h-4 text-slate-300" /></li>
            <li className="text-slate-900 truncate max-w-xs">{product.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-3xl flex items-center justify-center relative overflow-hidden border border-slate-200/60 shadow-sm">
              {product.has_image && product.image_url ? (
                <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="w-56 h-56 bg-slate-200 rounded-full flex items-center justify-center text-7xl font-bold text-slate-300 shadow-inner">
                  {product.brand.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-bold text-blue-600 mb-3 tracking-wider uppercase">{product.brand}</div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-4">{product.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                {product.avg_rating !== null && (
                  <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-sm text-slate-900">{product.avg_rating.toFixed(1)}</span>
                  </div>
                )}
                <a href="#reviews" className="text-sm font-medium text-slate-500 hover:text-blue-600 underline underline-offset-4 decoration-slate-300 hover:decoration-blue-600 transition-all">
                  {product.n_ratings.toLocaleString()} ratings
                </a>
              </div>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                  {product.price === null ? "Price unavailable" : `$${product.price.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* AI Recommendation Badge */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-8 flex gap-5 shadow-sm">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-1.5 text-lg">
                  Popular in {product.category} <Sparkles className="w-4 h-4 text-blue-600" />
                </h4>
                <p className="text-sm text-blue-800/80 leading-relaxed font-medium">
                  Ranked by RecoIA's popularity model from real interaction data in this category.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-8 mt-auto pt-6 border-t border-slate-100">
              <div className="flex gap-4">
                <Button
                  size="lg"
                  disabled={orderStatus === "placing"}
                  onClick={placeOrder}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-bold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  {orderStatus === "placing" ? "Placing order…" : "Place Order"}
                </Button>
                <Button size="icon" variant="outline" onClick={toggleSave} className="w-14 h-14 rounded-xl border-slate-200 text-slate-600 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">
                  <Heart className={saved ? "w-6 h-6 fill-rose-500 text-rose-500" : "w-6 h-6"} />
                </Button>
                <Button size="icon" variant="outline" className="w-14 h-14 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  <Share className="w-6 h-6" />
                </Button>
              </div>
              {orderStatus === "placed" && (
                <p className="mt-3 text-sm font-medium text-emerald-600">
                  Order placed! View it anytime from your Profile.
                </p>
              )}
              {orderStatus === "error" && (
                <p className="mt-3 text-sm font-medium text-rose-600">Unable to place the order. Please try again.</p>
              )}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex flex-col gap-1 items-start">
                <Truck className="w-5 h-5 text-slate-700 mb-1" />
                <span className="text-sm font-semibold text-slate-900">Free shipping</span>
                <span className="text-xs text-slate-500">2-3 business days</span>
              </div>
              <div className="flex flex-col gap-1 items-start">
                <RotateCcw className="w-5 h-5 text-slate-700 mb-1" />
                <span className="text-sm font-semibold text-slate-900">30-day returns</span>
                <span className="text-xs text-slate-500">No questions asked</span>
              </div>
              <div className="flex flex-col gap-1 items-start">
                <ShieldCheck className="w-5 h-5 text-slate-700 mb-1" />
                <span className="text-sm font-semibold text-slate-900">2-year warranty</span>
                <span className="text-xs text-slate-500">Full coverage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="mb-16">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent h-auto p-0 gap-8 mb-8">
              <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent pb-4 pt-2 px-1 data-[state=active]:shadow-none text-base font-semibold text-slate-500">Description</TabsTrigger>
              <TabsTrigger value="specs" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent pb-4 pt-2 px-1 data-[state=active]:shadow-none text-base font-semibold text-slate-500">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent pb-4 pt-2 px-1 data-[state=active]:shadow-none text-base font-semibold text-slate-500">Reviews ({product.n_ratings})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="text-slate-600 leading-relaxed max-w-3xl text-lg">
              <p>{product.title} from {product.brand}, in the {product.category} category.</p>
            </TabsContent>

            <TabsContent value="specs">
              <div className="max-w-3xl border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { label: "Brand", value: product.brand },
                      { label: "Category", value: product.category },
                      { label: "Item ID", value: product.item_id },
                      { label: "Average Rating", value: product.avg_rating !== null ? `${product.avg_rating.toFixed(1)} / 5` : "No ratings yet" },
                      { label: "Ratings Count", value: product.n_ratings.toLocaleString() },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <th className="px-6 py-4 font-semibold text-slate-900 bg-slate-50/50 w-1/3 border-r border-slate-200">{row.label}</th>
                        <td className="px-6 py-4 text-slate-600 font-medium">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="space-y-8 max-w-3xl" id="reviews">
                {[
                  { name: "Michael R.", date: "Oct 12, 2025", rating: 5, text: "Best noise cancellation I've ever experienced. Super comfortable for long flights." },
                  { name: "Sarah L.", date: "Sep 28, 2025", rating: 4, text: "Great sound, but the case is a bit bulky compared to the previous version." },
                  { name: "David K.", date: "Sep 15, 2025", rating: 5, text: "The multipoint connection works flawlessly between my Mac and iPhone." },
                ].map((review, i) => (
                  <div key={i} className="border-b border-slate-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900">{review.name}</h5>
                          <span className="text-sm font-medium text-slate-400">{review.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Product Recommendations */}
        {related.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => <MiniProductCard key={item.item_id} item={item} />)}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
