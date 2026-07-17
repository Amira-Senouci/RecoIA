import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, ArrowUpRight, Database, Server, Clock, Download, RefreshCw, ServerCrash, Cpu as CpuIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    { label: "AI Models", icon: Cpu, active: true },
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

const accuracyData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  hybrid: 94 + Math.sin(i / 2) + Math.random() * 0.5,
  sbert: 92 + Math.sin(i / 3) + Math.random() * 0.8,
  lightgcn: 90 + Math.cos(i / 2) + Math.random() * 0.6,
  lightfm: 88 + Math.sin(i / 4) + Math.random() * 1.0,
}));

const models = [
  { name: "SBERT Encoder", ver: "v1.4", status: "Active", acc: "94.2%", inf: "12ms", trained: "14 Jul 2026", size: "2.3M", metrics: { p: "0.86", r: "0.78", n: "0.89" } },
  { name: "LightGCN", ver: "v2.1", status: "Active", acc: "91.8%", inf: "8ms", trained: "10 Jul 2026", size: "2.3M", metrics: { p: "0.84", r: "0.76", n: "0.86" } },
  { name: "LightFM", ver: "v3.0", status: "Training", acc: "89.4%", inf: "15ms", trained: "8 Jul 2026", size: "2.3M", metrics: { p: "0.81", r: "0.74", n: "0.83" } },
  { name: "Hybrid Ranker", ver: "v2.3", status: "Active", acc: "96.1%", inf: "24ms", trained: "14 Jul 2026", size: "2.3M", metrics: { p: "0.89", r: "0.81", n: "0.92" } },
];

const recentPredictions = [
  { user: "usr_8492k1...", model: "Hybrid Ranker v2.3", product: "Apple AirPods Pro", conf: "96.4%", time: "22ms", stamp: "Just now" },
  { user: "usr_9124m5...", model: "SBERT Encoder v1.4", product: "Sony WH-1000XM5", conf: "92.1%", time: "11ms", stamp: "2 mins ago" },
  { user: "usr_3910x9...", model: "LightGCN v2.1", product: "Nike Air Max 270", conf: "88.7%", time: "8ms", stamp: "5 mins ago" },
  { user: "usr_7741p2...", model: "Hybrid Ranker v2.3", product: "Instant Pot Duo", conf: "94.2%", time: "25ms", stamp: "8 mins ago" },
  { user: "usr_2209q8...", model: "LightFM v3.0", product: "Samsung 65\" QLED", conf: "81.5%", time: "14ms", stamp: "12 mins ago" },
];

export function AIModelsPage() {
  return (
    <AdminLayout activeLabel="AI Models" title="AI Models" breadcrumb="AI / Model Management">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Current Pipeline: <span className="font-bold text-slate-900">Hybrid Ranker v2.3</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Metrics
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </Button>
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
              <CpuIcon className="w-4 h-4" />
              Retrain All
            </Button>
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {models.map((m, i) => (
            <Card key={i} className={`border-slate-200 shadow-sm rounded-xl overflow-hidden ${m.status === 'Training' ? 'border-yellow-200' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-2 rounded-md">{m.ver}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">Trained on {m.size} interactions • {m.trained}</p>
                  </div>
                  <Badge variant="outline" className={`border-none font-medium px-2.5 py-1 ${
                    m.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {m.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block"></span>}
                    {m.status === 'Training' && <RefreshCw className="w-3 h-3 mr-1.5 inline-block animate-spin" />}
                    {m.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
                    <p className="text-xl font-bold text-slate-900">{m.acc}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Inference Time</p>
                    <p className="text-xl font-bold text-slate-900">{m.inf}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-medium">Precision: {m.metrics.p}</Badge>
                  <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-medium">Recall: {m.metrics.r}</Badge>
                  <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-medium">NDCG: {m.metrics.n}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Infrastructure & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-xl h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-500" /> Infrastructure Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">GPU Utilization</span>
                    <span className="font-bold text-slate-900">42%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">Memory (VRAM)</span>
                    <span className="font-bold text-slate-900">18.4 / 24 GB</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Uptime</p>
                    <p className="text-lg font-bold text-slate-900">99.97%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Queue Depth</p>
                    <p className="text-lg font-bold text-slate-900">143 req</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm rounded-xl h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-900">Model Accuracy Over Time (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                      <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" name="Hybrid Ranker" dataKey="hybrid" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" name="SBERT" dataKey="sbert" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                      <Line type="monotone" name="LightGCN" dataKey="lightgcn" stroke="#10B981" strokeWidth={2} dot={false} />
                      <Line type="monotone" name="LightFM" dataKey="lightfm" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Predictions Table */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Predictions Stream</CardTitle>
            <CardDescription>Live feed of model inferences</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">Model Used</th>
                  <th className="px-6 py-3">Top Product Recommended</th>
                  <th className="px-6 py-3">Confidence</th>
                  <th className="px-6 py-3">Latency</th>
                  <th className="px-6 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentPredictions.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.user}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.model}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.product}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">{item.conf}</td>
                    <td className="px-6 py-4 text-slate-600">{item.time}</td>
                    <td className="px-6 py-4 text-right text-slate-400">{item.stamp}</td>
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
