import React from 'react';
import { AppLayout } from './_shared/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Star, Heart, Share, ShieldCheck, Truck, RotateCcw, Network, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ProductDetail() {
  const product = {
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    brand: "Sony",
    price: 349.99,
    origPrice: 429.99,
    rating: 4.7,
    reviews: 2847,
    discount: 18,
    match: 91
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-16">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 mb-8 font-medium">
          <ol className="flex items-center space-x-2">
            <li><a href="#" className="hover:text-blue-600 transition-colors">Home</a></li>
            <li><ChevronRight className="w-4 h-4 text-slate-300" /></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Electronics</a></li>
            <li><ChevronRight className="w-4 h-4 text-slate-300" /></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Audio</a></li>
            <li><ChevronRight className="w-4 h-4 text-slate-300" /></li>
            <li className="text-slate-900">Sony WH-1000XM5</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-3xl flex items-center justify-center relative overflow-hidden border border-slate-200/60 shadow-sm">
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <Badge className="bg-white text-slate-900 border-slate-200 hover:bg-white shadow-sm font-semibold px-3 py-1">
                  Best Seller
                </Badge>
              </div>
              <div className="w-56 h-56 bg-slate-200 rounded-full flex items-center justify-center text-7xl font-bold text-slate-300 shadow-inner">
                S
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`aspect-square rounded-2xl bg-slate-100 border-2 flex items-center justify-center cursor-pointer transition-all ${i === 1 ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'}`}>
                  <div className="w-12 h-12 bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-bold text-blue-600 mb-3 tracking-wider uppercase">{product.brand}</div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm text-slate-900">{product.rating}</span>
                </div>
                <a href="#reviews" className="text-sm font-medium text-slate-500 hover:text-blue-600 underline underline-offset-4 decoration-slate-300 hover:decoration-blue-600 transition-all">
                  {product.reviews.toLocaleString()} reviews
                </a>
              </div>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">${product.price}</span>
                <span className="text-xl text-slate-400 line-through font-medium mb-1.5">${product.origPrice}</span>
                <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border border-red-100 mb-2 font-bold px-3 py-1">
                  {product.discount}% OFF
                </Badge>
              </div>
            </div>

            {/* AI Recommendation Badge */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-8 flex gap-5 shadow-sm">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-1.5 text-lg">
                  AI Match: {product.match}% <Sparkles className="w-4 h-4 text-blue-600" />
                </h4>
                <p className="text-sm text-blue-800/80 leading-relaxed font-medium">
                  Recommended because you frequently browse electronics and recently viewed premium audio products. High confidence fit based on your purchase history.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8 mt-auto pt-6 border-t border-slate-100">
              <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-transform active:scale-[0.98]">
                Add to Cart
              </Button>
              <Button size="icon" variant="outline" className="w-14 h-14 rounded-xl border-slate-200 text-slate-600 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">
                <Heart className="w-6 h-6" />
              </Button>
              <Button size="icon" variant="outline" className="w-14 h-14 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <Share className="w-6 h-6" />
              </Button>
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
              <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent pb-4 pt-2 px-1 data-[state=active]:shadow-none text-base font-semibold text-slate-500">Reviews ({product.reviews})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="text-slate-600 leading-relaxed max-w-3xl text-lg">
              <p>Experience industry-leading noise cancellation and premium sound quality with the Sony WH-1000XM5. Featuring a sleek, lightweight design and up to 30 hours of battery life, these headphones are built for all-day listening.</p>
            </TabsContent>
            
            <TabsContent value="specs">
              <div className="max-w-3xl border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { label: "Brand", value: "Sony" },
                      { label: "Model", value: "WH-1000XM5" },
                      { label: "Connectivity", value: "Bluetooth 5.2" },
                      { label: "Battery Life", value: "30 hours (ANC on)" },
                      { label: "Weight", value: "250g" },
                      { label: "Noise Cancellation", value: "Yes, Dual Processor" },
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

        {/* Product Recommendations Rows */}
        <div className="space-y-12">
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Customers Also Bought</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 1, name: "Sony WF-1000XM4 True Wireless Earbuds", brand: "Sony", price: 278.00, rating: 4.6, reviews: 1450, color: "bg-slate-100" },
                { id: 2, name: "Keychron Q1 Pro Mechanical Keyboard", brand: "Keychron", price: 199.00, rating: 4.8, reviews: 342, color: "bg-neutral-100" },
                { id: 3, name: "Logitech MX Master 3S Wireless Mouse", brand: "Logitech", price: 99.99, rating: 4.9, reviews: 4120, color: "bg-stone-100" },
                { id: 4, name: "Belkin 3-in-1 MagSafe Charging Stand", brand: "Belkin", price: 149.99, rating: 4.7, reviews: 890, color: "bg-zinc-100" },
              ].map(product => (
                <Card key={product.id} className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className={`relative h-48 ${product.color} flex items-center justify-center p-6`}>
                    <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-3xl font-bold text-slate-300">
                      {product.brand.charAt(0)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{product.brand}</div>
                    <h4 className="font-semibold text-slate-900 leading-tight mb-2 h-10 line-clamp-2 text-sm">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
                    </div>
                    <div className="font-bold text-lg text-slate-900 leading-none">${product.price.toFixed(2)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Similar Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 1, name: "Bose QuietComfort Ultra Headphones", brand: "Bose", price: 429.00, rating: 4.8, reviews: 2105, color: "bg-slate-200" },
                { id: 2, name: "AirPods Max - Space Gray", brand: "Apple", price: 549.00, rating: 4.7, reviews: 3102, color: "bg-slate-50" },
                { id: 3, name: "Sennheiser Momentum 4 Wireless", brand: "Sennheiser", price: 379.95, rating: 4.5, reviews: 843, color: "bg-stone-50" },
                { id: 4, name: "Bowers & Wilkins Momentum Wireless", brand: "Bowers & Wilkins", price: 399.00, rating: 4.6, reviews: 456, color: "bg-zinc-50" },
              ].map(product => (
                <Card key={product.id} className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className={`relative h-48 ${product.color} flex items-center justify-center p-6`}>
                    <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-3xl font-bold text-slate-300">
                      {product.brand.charAt(0)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{product.brand}</div>
                    <h4 className="font-semibold text-slate-900 leading-tight mb-2 h-10 line-clamp-2 text-sm">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
                    </div>
                    <div className="font-bold text-lg text-slate-900 leading-none">${product.price.toFixed(2)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
