import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, ArrowUpRight, ArrowDownRight, CircleUser, Lock, Activity as ActivityIcon, MessageSquareWarning } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
      {/* Logo */}
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
      {/* Nav */}
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
      {/* Profile */}
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

// MOCK DATA
const dauData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  users: Math.floor(8000 + Math.random() * 7000 + (i * 100))
}));

const revData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  revenue: Math.floor(50000 + Math.random() * 70000 + (i * 500)),
  orders: Math.floor(200 + Math.random() * 400 + (i * 5))
}));

const modelPerformance = [
  { name: 'Collab Filtering', ctr: 38 },
  { name: 'Content-Based', ctr: 32 },
  { name: 'Hybrid', ctr: 41 },
  { name: 'Neural CF', ctr: 44 }
];

const categoryData = [
  { name: 'Electronics', value: 32 },
  { name: 'Fashion', value: 21 },
  { name: 'Home', value: 18 },
  { name: 'Sports', value: 12 },
  { name: 'Beauty', value: 10 },
  { name: 'Other', value: 7 },
];
const COLORS = ['#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF'];

const recentActivity = [
  { text: "New user registered – John Park", time: "2m ago", type: "user", icon: Users, color: "text-blue-500", dot: "bg-blue-500" },
  { text: "Large order placed – $1,240", time: "15m ago", type: "order", icon: ShoppingBag, color: "text-emerald-500", dot: "bg-emerald-500" },
  { text: "AI model retrained successfully", time: "1h ago", type: "ai", icon: Cpu, color: "text-purple-500", dot: "bg-purple-500" },
  { text: "Recommendation anomaly detected", time: "2h ago", type: "alert", icon: ActivityIcon, color: "text-red-500", dot: "bg-red-500" },
  { text: "New product added – Sony WH-1000XM6", time: "3h ago", type: "product", icon: Package, color: "text-orange-500", dot: "bg-orange-500" },
  { text: "Password reset requested", time: "4h ago", type: "auth", icon: Lock, color: "text-slate-500", dot: "bg-slate-500" },
];

const modelHealth = [
  { model: "SBERT", status: "Active", acc: "94.2%", time: "12ms", updated: "2h ago" },
  { model: "LightGCN", status: "Active", acc: "91.8%", time: "8ms", updated: "2h ago" },
  { model: "LightFM", status: "Active", acc: "89.4%", time: "15ms", updated: "1d ago" },
  { model: "Hybrid Ranker", status: "Active", acc: "96.1%", time: "24ms", updated: "2h ago" },
];


export function Dashboard() {
  return (
    <AdminLayout activeLabel="Dashboard" title="Dashboard">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* KPI Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: "84,291", trend: "+12.3%", up: true },
            { label: "Monthly Revenue", value: "$2,418,650", trend: "+8.7%", up: true },
            { label: "Recommendation CTR", value: "34.2%", trend: "+5.1%", up: true },
            { label: "Avg. Session Time", value: "4m 32s", trend: "+0.8%", up: true },
          ].map((kpi, i) => (
            <Card key={i} className="border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-2">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-slate-900 leading-none">{kpi.value}</h3>
                  <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${kpi.up ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                    {kpi.trend} {kpi.up ? '↑' : '↓'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* KPI Row 2 */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Active Users (today)", value: "12,847" },
            { label: "New Users (week)", value: "3,291" },
            { label: "Conversion Rate", value: "7.8%" },
            { label: "Avg. Rating", value: "4.6 ★" },
          ].map((kpi, i) => (
            <Card key={i} className="border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                  <h3 className="text-xl font-bold text-slate-900">{kpi.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Daily Active Users – Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dauData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} domain={['dataMin - 1000', 'dataMax + 1000']} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Revenue & Orders – Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={10} hide />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#64748B" fill="#64748B" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Recommendation Performance by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelPerformance} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="ctr" fill="#2563EB" radius={[4, 4, 0, 0]} name="CTR %" maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex flex-col items-center justify-center pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                  {categoryData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-xs font-medium text-slate-600">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-slate-200">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-4 border-white ${item.dot} z-10`}>
                      <item.icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium text-slate-900">{item.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">AI Model Health</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-medium">Model</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Accuracy</th>
                    <th className="px-6 py-3 font-medium">Inference Time</th>
                    <th className="px-6 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modelHealth.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{m.model}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-medium px-2 py-0.5 rounded-md shadow-none flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {m.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{m.acc}</td>
                      <td className="px-6 py-4 text-slate-600">{m.time}</td>
                      <td className="px-6 py-4 text-slate-500">{m.updated}</td>
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
