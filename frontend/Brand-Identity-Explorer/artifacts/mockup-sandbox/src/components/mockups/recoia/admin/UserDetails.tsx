import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, ArrowLeft, Mail, Calendar, MapPin, Monitor, Clock, ShieldAlert, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ADMIN_NAV = [
  { group: "Overview", items: [{ label: "Dashboard", icon: LayoutDashboard, active: false }] },
  { group: "Data", items: [
    { label: "Users", icon: Users },
    { label: "Products", icon: Package },
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
              const active = item.label === activeLabel;
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

const activityData = Array.from({ length: 14 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  sessions: Math.floor(1 + Math.random() * 5)
}));

const recentPurchases = [
  { item: "Sony WH-1000XM5", price: "$349.00", date: "Oct 24, 2024", status: "Delivered" },
  { item: "Logitech MX Master 3S", price: "$99.99", date: "Sep 12, 2024", status: "Delivered" },
  { item: "Keychron Q1 Pro", price: "$199.00", date: "Aug 05, 2024", status: "Delivered" },
];

const recoHistory = [
  { product: "Apple AirPods Pro", model: "Hybrid Ranker", conf: "94%", clicked: true, date: "2 hours ago" },
  { product: "Anker USB-C Hub", model: "Collab Filter", conf: "82%", clicked: false, date: "1 day ago" },
  { product: "Samsung T7 SSD", model: "Content-Based", conf: "89%", clicked: true, date: "3 days ago" },
  { product: "Ergonomic Wrist Rest", model: "Hybrid Ranker", conf: "76%", clicked: false, date: "1 week ago" },
  { product: "Dell UltraSharp 27\"", model: "Neural CF", conf: "91%", clicked: true, date: "2 weeks ago" },
];

export function UserDetailsPage() {
  return (
    <AdminLayout activeLabel="Users" title="User Details" breadcrumb="Users / Alex Johnson">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-inner">
                  AJ
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Alex Johnson</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-4 h-4" /> alex@example.com</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">User</Badge>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 border-none">Active</Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none">Edit User</Button>
                <Button variant="outline" className="flex-1 md:flex-none text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700">Suspend User</Button>
                <Button variant="outline" className="flex-1 md:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Delete</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Registration Date</p>
                <p className="font-semibold text-slate-900">Feb 14, 2024</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><ShieldAlert className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Email Verified</p>
                <p className="font-semibold text-slate-900 flex items-center gap-1">Yes <span className="text-green-500">✓</span></p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><Clock className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Last Login</p>
                <p className="font-semibold text-slate-900">1 hour ago</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><Clock className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Account Age</p>
                <p className="font-semibold text-slate-900">8 months</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><MapPin className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Location</p>
                <p className="font-semibold text-slate-900">New York, USA</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><Monitor className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Device</p>
                <p className="font-semibold text-slate-900">Chrome on macOS</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs mock */}
        <div className="border-b border-slate-200">
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="text-blue-600 border-b-2 border-blue-600 pb-3 px-1">Overview</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">Activity</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">Recommendations</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">History</a>
          </div>
        </div>

        {/* Overview Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-900">Favorite Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex gap-2 flex-wrap">
                {["Electronics", "Gadgets", "Audio", "Wearables"].map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">Recent Purchases</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 h-8">View All</Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentPurchases.map((p, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-slate-900">{p.item}</td>
                        <td className="px-4 py-3 text-slate-600">{p.price}</td>
                        <td className="px-4 py-3 text-slate-600">{p.date}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">{p.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Card className="border-slate-200 shadow-sm bg-slate-50">
                  <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-slate-900">23</p>
                  </CardContent>
               </Card>
               <Card className="border-slate-200 shadow-sm bg-slate-50">
                  <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-slate-900">$3,412</p>
                  </CardContent>
               </Card>
               <Card className="border-slate-200 shadow-sm bg-slate-50">
                  <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recos Clicked</p>
                    <p className="text-3xl font-bold text-slate-900">187</p>
                  </CardContent>
               </Card>
               <Card className="border-slate-200 shadow-sm bg-slate-50">
                  <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Rating Given</p>
                    <p className="text-3xl font-bold text-slate-900">4.4</p>
                  </CardContent>
               </Card>
            </div>

          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-900">Activity (Last 14 Days)</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 min-h-[250px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" hide />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="sessions" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendation History */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Recommendations</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Product Recommended</th>
                  <th className="px-6 py-3">Model Used</th>
                  <th className="px-6 py-3">Confidence</th>
                  <th className="px-6 py-3">Clicked</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recoHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.product}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">{row.model}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{row.conf}</td>
                    <td className="px-6 py-4">
                      {row.clicked ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Yes</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </AdminLayout>
  );
}
