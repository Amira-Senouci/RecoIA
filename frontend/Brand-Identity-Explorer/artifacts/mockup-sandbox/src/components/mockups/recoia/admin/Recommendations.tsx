import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ADMIN_NAV = [
  { group: "Overview", items: [{ label: "Dashboard", icon: LayoutDashboard, active: false }] },
  { group: "Data", items: [
    { label: "Users", icon: Users },
    { label: "Products", icon: Package },
    { label: "Categories", icon: Tag },
    { label: "Orders", icon: ShoppingBag },
  ]},
  { group: "AI", items: [
    { label: "Recommendations", icon: Sparkles, active: true },
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

const modelCtrData = [
  { name: 'Collaborative', ctr: 34 },
  { name: 'Content-Based', ctr: 28 },
  { name: 'Hybrid', ctr: 41 },
  { name: 'Neural CF', ctr: 44 }
];

const confDistribution = [
  { range: '<60%', value: 8 },
  { range: '60-69%', value: 11 },
  { range: '70-79%', value: 21 },
  { range: '80-89%', value: 28 },
  { range: '90-100%', value: 32 }
];

const coldStartData = Array.from({ length: 7 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  withCold: 0.75 + Math.random() * 0.15,
  withoutCold: 0.60 + Math.random() * 0.10
}));

const rpmData = Array.from({ length: 60 }).map((_, i) => ({
  minute: i,
  rpm: Math.floor(1800 + Math.random() * 1000 + (Math.sin(i / 5) * 500))
}));

const topRecommended = [
  { rank: 1, name: "Apple AirPods Pro", cat: "Electronics", count: "12,401", ctr: "42.1%", conv: "8.4%" },
  { rank: 2, name: "Sony WH-1000XM5", cat: "Electronics", count: "9,842", ctr: "38.5%", conv: "7.2%" },
  { rank: 3, name: "Nike Air Max 270", cat: "Fashion", count: "8,102", ctr: "31.2%", conv: "6.8%" },
  { rank: 4, name: "Instant Pot Duo", cat: "Home", count: "7,543", ctr: "29.8%", conv: "9.1%" },
  { rank: 5, name: "Samsung T7 SSD", cat: "Electronics", count: "6,921", ctr: "35.4%", conv: "11.2%" },
];

const modelComparison = [
  { name: "Neural CF", prec: "0.862", rec: "0.781", map: "0.824", ndcg: "0.902", inf: "45ms", best: true },
  { name: "Hybrid Ranker", prec: "0.847", rec: "0.763", map: "0.812", ndcg: "0.891", inf: "24ms", best: false },
  { name: "Collaborative Filtering", prec: "0.791", rec: "0.712", map: "0.745", ndcg: "0.812", inf: "12ms", best: false },
  { name: "Content-Based", prec: "0.724", rec: "0.684", map: "0.692", ndcg: "0.754", inf: "8ms", best: false },
];

export function RecommendationsPage() {
  return (
    <AdminLayout activeLabel="Recommendations" title="Recommendation Analytics">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* KPI Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Precision@10", value: "0.847" },
            { label: "Recall@10", value: "0.763" },
            { label: "MAP", value: "0.812" },
            { label: "NDCG", value: "0.891" },
          ].map((kpi, i) => (
            <Card key={i} className="border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-2">{kpi.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 leading-none">{kpi.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* KPI Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Avg. CTR", value: "34.2%" },
            { label: "Conversion Rate", value: "7.8%" },
            { label: "Avg. Confidence", value: "88.4%" },
            { label: "Requests/min", value: "2,841" },
          ].map((kpi, i) => (
            <Card key={i} className="border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                <h3 className="text-xl font-bold text-slate-900">{kpi.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Recommendation CTR by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelCtrData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="ctr" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={50} name="CTR %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Confidence Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confDistribution} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#60A5FA" radius={[4, 4, 0, 0]} maxBarSize={50} name="% of Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Cold Start Performance (NDCG)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={coldStartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis domain={[0.4, 1.0]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" name="With Cold Start" dataKey="withCold" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} />
                    <Line type="monotone" name="Without Cold Start" dataKey="withoutCold" stroke="#94A3B8" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4, fill: '#94A3B8', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Requests Per Minute – Last Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rpmData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="minute" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="rpm" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} name="Requests/min" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white">
              <CardTitle className="text-base font-semibold text-slate-900">Top Recommended Products</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Recos</th>
                    <th className="px-6 py-3">CTR</th>
                    <th className="px-6 py-3">Conv.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {topRecommended.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">#{item.rank}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600">{item.cat}</td>
                      <td className="px-6 py-4 text-slate-600">{item.count}</td>
                      <td className="px-6 py-4 font-medium text-blue-600">{item.ctr}</td>
                      <td className="px-6 py-4 text-slate-600">{item.conv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white">
              <CardTitle className="text-base font-semibold text-slate-900">Model Comparison</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3">Precision</th>
                    <th className="px-6 py-3">Recall</th>
                    <th className="px-6 py-3">MAP</th>
                    <th className="px-6 py-3">NDCG</th>
                    <th className="px-6 py-3">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {modelComparison.map((item, i) => (
                    <tr key={i} className={item.best ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}>
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                        {item.name}
                        {item.best && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-1.5 py-0 shadow-none text-[10px]">BEST</Badge>}
                      </td>
                      <td className={`px-6 py-4 ${item.best ? 'font-semibold text-blue-700' : 'text-slate-600'}`}>{item.prec}</td>
                      <td className={`px-6 py-4 ${item.best ? 'font-semibold text-blue-700' : 'text-slate-600'}`}>{item.rec}</td>
                      <td className={`px-6 py-4 ${item.best ? 'font-semibold text-blue-700' : 'text-slate-600'}`}>{item.map}</td>
                      <td className={`px-6 py-4 ${item.best ? 'font-semibold text-blue-700' : 'text-slate-600'}`}>{item.ndcg}</td>
                      <td className="px-6 py-4 text-slate-600">{item.inf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </AdminLayout>
  );
}
