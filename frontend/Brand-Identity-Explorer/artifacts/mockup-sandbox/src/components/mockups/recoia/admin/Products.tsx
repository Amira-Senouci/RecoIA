import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, Search, Filter, Download, Plus, MoreHorizontal, Edit, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ADMIN_NAV = [
  { group: "Overview", items: [{ label: "Dashboard", icon: LayoutDashboard, active: false }] },
  { group: "Data", items: [
    { label: "Users", icon: Users },
    { label: "Products", icon: Package, active: true },
    { label: "Categories", icon: Tag },
    { label: "Orders", icon: ShoppingBag },
  ]},
  { group: "AI", items: [
    { label: "Recommendations", icon: Sparkles },
    { label: "AI Models", icon: Cpu },
  ]},
  { group: "Insights", items: [
    { label: "Analytics", icon: BarChart2 },
    { label: "Reports", icon: FileText },
    { label: "Activity Logs", icon: Activity },
  ]},
  { group: "System", items: [{ label: "Settings", icon: Settings }] },
];

function AdminSidebar({ activeLabel }: { activeLabel: string }) {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth="2"/>
              <path strokeLinecap="round" strokeWidth="2" d="M12 3v2M12 19v2M3 12h2M19 12h2"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-semibold text-base leading-none">RecoIA</div>
            <div className="text-slate-500 text-xs mt-0.5">Admin Console</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {ADMIN_NAV.map(group => (
          <div key={group.group}>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">{group.group}</p>
            {group.items.map(item => {
              const active = item.label === activeLabel || item.active;
              return (
                <a key={item.label} href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </a>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden"><img src="https://i.pravatar.cc/150?u=admin42" className="w-full h-full object-cover" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Sarah Mitchell</p>
            <p className="text-slate-500 text-xs truncate">Super Admin</p>
          </div>
          <button className="text-slate-500 hover:text-white"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-20">
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{breadcrumb ?? "Admin Console"}</p>
        <h1 className="text-lg font-semibold text-slate-900 leading-none">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/150?u=admin42" className="w-full h-full object-cover" /></div>
      </div>
    </header>
  );
}

function AdminLayout({ children, activeLabel, title, breadcrumb }: { children: React.ReactNode; activeLabel: string; title: string; breadcrumb?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AdminSidebar activeLabel={activeLabel} />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminTopbar title={title} breadcrumb={breadcrumb} />
        <main className="flex-1 pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}

const mockProducts = [
  { id: 1, name: "Sony WH-1000XM5", cat: "Electronics", brand: "Sony", price: "$349.00", stock: 145, rating: 4.7, count: 1204, score: 94, status: "Active" },
  { id: 2, name: "Nike Air Max 270", cat: "Fashion", brand: "Nike", price: "$129.00", stock: 312, rating: 4.4, count: 854, score: 87, status: "Active" },
  { id: 3, name: "Samsung 65\" QLED", cat: "Electronics", brand: "Samsung", price: "$1,299.00", stock: 28, rating: 4.6, count: 432, score: 91, status: "Active" },
  { id: 4, name: "Instant Pot Duo", cat: "Home", brand: "Instant Pot", price: "$89.00", stock: 203, rating: 4.8, count: 3291, score: 88, status: "Active" },
  { id: 5, name: "Apple AirPods Pro", cat: "Electronics", brand: "Apple", price: "$249.00", stock: 8, rating: 4.9, count: 4120, score: 96, status: "Low Stock" },
  { id: 6, name: "Levi's 501 Jeans", cat: "Fashion", brand: "Levi's", price: "$69.00", stock: 445, rating: 4.3, count: 120, score: 79, status: "Active" },
  { id: 7, name: "Dyson V15 Vacuum", cat: "Home", brand: "Dyson", price: "$699.00", stock: 56, rating: 4.7, count: 215, score: 85, status: "Active" },
  { id: 8, name: "Adidas Ultraboost", cat: "Fashion", brand: "Adidas", price: "$179.00", stock: 189, rating: 4.5, count: 643, score: 82, status: "Active" },
  { id: 9, name: "Kindle Paperwhite", cat: "Books", brand: "Amazon", price: "$139.00", stock: 0, rating: 4.8, count: 1890, score: 90, status: "Out of Stock" },
  { id: 10, name: "Bose QC45", cat: "Electronics", brand: "Bose", price: "$279.00", stock: 67, rating: 4.6, count: 754, score: 88, status: "Active" },
];

export function ProductsPage() {
  return (
    <AdminLayout activeLabel="Products" title="Products">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">Total Products</span>
            <span className="text-2xl font-bold text-slate-900">12,847</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">In Stock</span>
            <span className="text-2xl font-bold text-green-600">11,293</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">Low Stock</span>
            <span className="text-2xl font-bold text-yellow-600">892</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
            <span className="text-slate-500 text-sm font-medium mb-1">Out of Stock</span>
            <span className="text-2xl font-bold text-red-600">662</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search products..." className="pl-9 bg-slate-50" />
            </div>
            <Select defaultValue="all-cats">
              <SelectTrigger className="w-36 bg-slate-50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-cats">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="home">Home</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-stock">
              <SelectTrigger className="w-36 bg-slate-50">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-stock">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

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
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Rec Score</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockProducts.map((prod, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-900 truncate max-w-[200px]">{prod.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{prod.cat}</td>
                    <td className="px-6 py-4 text-slate-600">{prod.brand}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{prod.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{prod.stock}</span>
                        {prod.stock === 0 ? (
                          <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-50 border-none px-1.5 py-0">Out</Badge>
                        ) : prod.stock < 20 ? (
                          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-none px-1.5 py-0">Low</Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 font-bold">★</span>
                        <span className="font-medium text-slate-900">{prod.rating}</span>
                        <span className="text-slate-400 text-xs">({prod.count})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 w-32">
                        <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${prod.score > 90 ? 'bg-green-500' : prod.score > 80 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${prod.score}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 w-6">{prod.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-white">
            <span className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">10</span> of <span className="font-medium text-slate-900">12,847</span> products</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>Prev</Button>
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="px-2 text-slate-400">...</span>
              <Button variant="outline" size="sm">1285</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
