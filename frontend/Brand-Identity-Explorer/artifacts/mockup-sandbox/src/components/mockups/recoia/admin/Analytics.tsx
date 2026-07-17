import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    { label: "Recommendations", icon: Sparkles },
    { label: "AI Models", icon: Cpu },
  ]},
  { group: "Insights", items: [
    { label: "Analytics", icon: BarChart2, active: true },
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

const dauData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  users: Math.floor(8000 + Math.random() * 4000 + (i * 100))
}));

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const userGrowth = months.map((m, i) => ({
  month: m,
  new: Math.floor(2000 + Math.random() * 1000 + (i * 200)),
  returning: Math.floor(5000 + Math.random() * 2000 + (i * 400)),
}));

const revTrend = months.map((m, i) => ({
  month: m,
  rev: Math.floor(1800000 + Math.random() * 400000 + (i * 50000)),
}));

const categorySales = [
  { name: 'Electronics', sales: 420 },
  { name: 'Fashion', sales: 310 },
  { name: 'Home', sales: 250 },
  { name: 'Sports', sales: 180 },
  { name: 'Beauty', sales: 150 },
  { name: 'Other', sales: 90 },
];

const topCountries = [
  { flag: '🇺🇸', name: 'United States', users: '34,291', rev: '$1.2M', sessions: '124k' },
  { flag: '🇬🇧', name: 'United Kingdom', users: '12,401', rev: '$450k', sessions: '45k' },
  { flag: '🇩🇪', name: 'Germany', users: '9,842', rev: '$380k', sessions: '36k' },
  { flag: '🇨🇦', name: 'Canada', users: '8,102', rev: '$290k', sessions: '31k' },
  { flag: '🇫🇷', name: 'France', users: '7,543', rev: '$240k', sessions: '28k' },
];

const mostActive = [
  { initial: 'AJ', name: 'Alex Johnson', sessions: 142, pages: 840, clicks: 84, color: 'bg-blue-500' },
  { initial: 'MG', name: 'Maria Garcia', sessions: 128, pages: 750, clicks: 76, color: 'bg-purple-500' },
  { initial: 'EK', name: 'Emma Kwan', sessions: 115, pages: 620, clicks: 61, color: 'bg-emerald-500' },
  { initial: 'DP', name: 'David Park', sessions: 98, pages: 510, clicks: 54, color: 'bg-orange-500' },
  { initial: 'SJ', name: 'Sarah Jones', sessions: 84, pages: 420, clicks: 42, color: 'bg-pink-500' },
];

export function AnalyticsPage() {
  return (
    <AdminLayout activeLabel="Analytics" title="Analytics">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Date Range Toolbar */}
        <div className="flex justify-end mb-2">
          <div className="inline-flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50">7D</button>
            <button className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md">30D</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50">90D</button>
            <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 rounded-md flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Oct 1, 2024 - Oct 30, 2024
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "DAU", value: "12,847", trend: "+14%", up: true },
            { label: "MAU", value: "84,291", trend: "+8.7%", up: true },
            { label: "Returning Users", value: "68%", trend: "+2.1%", up: true },
            { label: "Avg. Session", value: "4m 32s", trend: "-1.2%", up: false },
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

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Daily Active Users</CardTitle>
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
              <CardTitle className="text-base font-semibold text-slate-900">User Growth (12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="returning" stackId="1" stroke="#64748B" fill="#94A3B8" fillOpacity={0.5} name="Returning" />
                    <Area type="monotone" dataKey="new" stackId="1" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.8} name="New Users" />
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
              <CardTitle className="text-base font-semibold text-slate-900">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} tickFormatter={(val) => `$${val/1000000}M`} />
                    <Tooltip formatter={(value: number) => `$${(value/1000000).toFixed(2)}M`} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="rev" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2.5} name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Sales by Category ($k)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} dx={-10} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="sales" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} name="Sales ($k)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white">
              <CardTitle className="text-base font-semibold text-slate-900">Top Countries</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Country</th>
                    <th className="px-6 py-3 text-right">Users</th>
                    <th className="px-6 py-3 text-right">Revenue</th>
                    <th className="px-6 py-3 text-right">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {topCountries.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                        <span className="text-xl">{item.flag}</span> {item.name}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">{item.users}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">{item.rev}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{item.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white">
              <CardTitle className="text-base font-semibold text-slate-900">Most Active Users</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3 text-right">Sessions</th>
                    <th className="px-6 py-3 text-right">Pages</th>
                    <th className="px-6 py-3 text-right">Recos Clicked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {mostActive.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${item.color}`}>
                          {item.initial}
                        </div>
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">{item.sessions}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{item.pages}</td>
                      <td className="px-6 py-4 text-right font-medium text-blue-600">{item.clicks}</td>
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

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
