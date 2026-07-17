import React from 'react';
import { AppLayout } from './_shared/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, Sparkles, ChevronRight, Tag } from 'lucide-react';

const RECOMMENDATIONS = [
  { id: 1, name: "Sony WH-1000XM5 Wireless Noise Canceling", brand: "Sony", price: 349.99, origPrice: 429.99, discount: 18, rating: 4.8, reviews: 1204, match: 98, color: "bg-slate-100" },
  { id: 2, name: "MacBook Air M2 (2022) - Space Gray", brand: "Apple", price: 1099.00, origPrice: 1199.00, discount: 8, rating: 4.9, reviews: 3402, match: 94, color: "bg-slate-50" },
  { id: 3, name: "AirPods Pro 2nd Gen with MagSafe", brand: "Apple", price: 199.99, origPrice: 249.00, discount: 20, rating: 4.7, reviews: 8431, match: 91, color: "bg-zinc-100" },
  { id: 4, name: "Samsung Odyssey G9 49\" Curved", brand: "Samsung", price: 1299.99, origPrice: 1499.99, discount: 13, rating: 4.6, reviews: 521, match: 88, color: "bg-slate-200" },
  { id: 5, name: "Keychron Q1 Pro Mechanical Keyboard", brand: "Keychron", price: 199.00, origPrice: null, discount: null, rating: 4.8, reviews: 342, match: 86, color: "bg-neutral-100" },
  { id: 6, name: "Logitech MX Master 3S Wireless Mouse", brand: "Logitech", price: 99.99, origPrice: null, discount: null, rating: 4.9, reviews: 4120, match: 85, color: "bg-stone-100" },
];

const CATEGORIES = [
  { name: "Electronics", icon: "💻" },
  { name: "Fashion", icon: "👕" },
  { name: "Home", icon: "🏠" },
  { name: "Sports", icon: "⚽" },
  { name: "Beauty", icon: "💄" },
  { name: "Books", icon: "📚" },
  { name: "Toys", icon: "🧸" },
  { name: "Automotive", icon: "🚗" },
];

const BRANDS = ["Nike", "Apple", "Sony", "Samsung", "Adidas", "Bose"];

function ProductCard({ product }: { product: any }) {
  return (
    <Card className="min-w-[260px] max-w-[260px] bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`relative h-52 ${product.color} flex items-center justify-center p-6 transition-transform group-hover:scale-[1.02]`}>
        {product.discount && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-[10px] font-bold px-2 py-0.5 border-none shadow-sm">
            {product.discount}% OFF
          </Badge>
        )}
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm hover:bg-white rounded-full h-8 w-8 text-slate-500 hover:text-red-500 transition-colors shadow-sm">
          <Heart className="h-4 w-4" />
        </Button>
        <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center text-4xl font-bold text-slate-300 shadow-inner">
          {product.brand.charAt(0)}
        </div>
      </div>
      <CardContent className="p-4 flex flex-col h-[180px]">
        {product.match && (
          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {product.match}% Match
          </div>
        )}
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{product.brand}</div>
        <h3 className="font-semibold text-slate-900 leading-tight mb-2 h-10 line-clamp-2 text-sm">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-auto">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
          <span className="text-xs text-slate-400">({product.reviews})</span>
        </div>
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100">
          <div>
            <div className="font-bold text-lg text-slate-900 leading-none">${product.price.toFixed(2)}</div>
            {product.origPrice && (
              <div className="text-xs text-slate-400 line-through mt-1">${product.origPrice.toFixed(2)}</div>
            )}
          </div>
          <Button size="sm" className="bg-slate-900 hover:bg-blue-600 text-white rounded-lg px-4 h-8 transition-colors">
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Home() {
  return (
    <AppLayout>
      <div className="space-y-12 pb-12 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Good morning, Alex 👋</h1>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1.5 text-sm font-semibold rounded-full w-fit shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            23 new recommendations
          </Badge>
        </div>

        {/* Personalized AI Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
              <div className="bg-blue-100 p-1.5 rounded-lg"><Sparkles className="w-5 h-5 text-blue-600" /></div>
              Top Picks For You
            </h2>
            <Button variant="ghost" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {RECOMMENDATIONS.map(product => (
              <div key={product.id} className="snap-start shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {/* Flash Deals */}
        <section className="bg-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 opacity-20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 opacity-20 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
          
          <div className="flex flex-col lg:flex-row gap-10 relative z-10 items-center">
            <div className="lg:w-1/3">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 border border-red-500/30">
                <Tag className="w-3.5 h-3.5" /> Flash Deals
              </div>
              <h2 className="text-4xl font-extrabold mb-4 leading-tight">Ends in <span className="text-blue-400">04:23:19</span></h2>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">Massive discounts on top electronics and gear. Limited quantities available.</p>
              <Button className="bg-white text-slate-900 hover:bg-blue-50 font-bold rounded-xl px-8 h-12">
                Shop All Deals
              </Button>
            </div>
            <div className="lg:w-2/3 flex gap-5 overflow-x-auto pb-4 w-full" style={{ scrollbarWidth: 'none' }}>
              {RECOMMENDATIONS.slice(0, 3).map(product => (
                <Card key={product.id} className="min-w-[260px] max-w-[260px] bg-slate-800/50 backdrop-blur-md border-slate-700 text-white shrink-0 shadow-lg">
                  <div className={`h-48 ${product.color} rounded-t-xl relative p-6 flex items-center justify-center opacity-90`}>
                    <Badge className="absolute top-3 left-3 bg-red-500 text-[10px] font-bold border-none">
                      {product.discount}% OFF
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="text-xs font-medium text-slate-400 mb-1">{product.brand}</div>
                    <h3 className="font-semibold line-clamp-1 mb-3 text-slate-100">{product.name}</h3>
                    <div className="flex items-end gap-2">
                      <div className="font-bold text-2xl">${product.price.toFixed(2)}</div>
                      <div className="text-sm text-slate-500 line-through pb-1">${product.origPrice?.toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-slate-900">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map(cat => (
              <button key={cat.name} className="flex flex-col items-center justify-center p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group">
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Popular Brands */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Popular Brands</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {BRANDS.map(brand => (
              <div key={brand} className="min-w-[160px] h-24 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-bold text-2xl text-slate-300 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm transition-all cursor-pointer shrink-0">
                {brand}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
