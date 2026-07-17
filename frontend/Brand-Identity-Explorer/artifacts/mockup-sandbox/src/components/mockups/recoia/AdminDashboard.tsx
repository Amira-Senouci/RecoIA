import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Search, Bell, Users, Package, ShoppingCart, Activity, BrainCircuit, Settings, ArrowUpRight, ArrowDownRight, LayoutDashboard, Database, Activity as ActivityIcon } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const lineData = [
  { name: '1', users: 12000 }, { name: '5', users: 12500 }, { name: '10', users: 11800 },
  { name: '15', users: 13200 }, { name: '20', users: 14500 }, { name: '25', users: 15100 }, { name: '30', users: 16800 }
];

const areaData = [
  { name: 'W1', revenue: 4000, orders: 2400 },
  { name: 'W2', revenue: 3000, orders: 1398 },
  { name: 'W3', revenue: 6000, orders: 4800 },
  { name: 'W4', revenue: 8780, orders: 6908 }
];

const barData = [
  { name: 'Collab', ctr: 24, conv: 18 },
  { name: 'Content', ctr: 13, conv: 8 },
  { name: 'Hybrid', ctr: 38, conv: 25 },
  { name: 'Neural', ctr: 45, conv: 32 }
];

const pieData = [
  { name: 'Electronics', value: 32 },
  { name: 'Fashion', value: 21 },
  { name: 'Home', value: 18 },
  { name: 'Sports', value: 12 },
  { name: 'Beauty', value: 10 },
  { name: 'Other', value: 7 },
];
const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#E0E7FF'];

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Admin Sidebar */}
      <aside className="w-[260px] bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50 bg-slate-950/50">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">RecoIA Admin</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-4 mb-8">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Overview</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 font-semibold transition-colors">
              <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard
            </a>
          </div>
          <div className="px-4 mb-8">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Data</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium transition-colors"><Users className="w-4.5 h-4.5" /> Users</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium transition-colors"><Package className="w-4.5 h-4.5" /> Products</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium transition-colors"><ShoppingCart className="w-4.5 h-4.5" /> Orders</a>
          </div>
          <div className="px-4 mb-8">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Intelligence</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium transition-colors"><Activity className="w-4.5 h-4.5" /> Recommendations</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium transition-colors"><BrainCircuit className="w-4.5 h-4.5" /> AI Models</a>
          </div>
          <div className="px-4 mb-8">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">System</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium transition-colors"><Settings className="w-4.5 h-4.5" /> Settings</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium transition-colors"><Database className="w-4.5 h-4.5" /> Logs</a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="text-slate-900 font-bold text-lg">Dashboard Overview</div>
          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search admin..." className="bg-slate-100 border border-transparent rounded-full pl-9 pr-4 py-2 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none w-72 transition-all" />
            </div>
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-100 cursor-pointer hover:border-blue-500 transition-colors">
              <img src="https://i.pravatar.cc/150?u=admin2" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* KPI Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Users", val: "84,291", trend: "+12.3%", up: true },
                { title: "Monthly Revenue", val: "$2.4M", trend: "+8.7%", up: true },
                { title: "Recommendation CTR", val: "34.2%", trend: "+5.1%", up: true },
                { title: "Avg. Session Time", val: "4m 32s", trend: "-0.8%", up: false },
              ].map((k, i) => (
                <Card key={i} className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden group hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-slate-500 mb-3">{k.title}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{k.val}</h3>
                      <div className={`flex items-center text-sm font-bold px-2 py-1 rounded-md ${k.up ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                        {k.up ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {k.trend}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* KPI Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Users (today)</p>
                    <h3 className="text-xl font-bold text-slate-900">12,847</h3>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-slate-400" /></div>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">New Users (week)</p>
                    <h3 className="text-xl font-bold text-slate-900">3,291</h3>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><ActivityIcon className="w-5 h-5 text-slate-400" /></div>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Conversion Rate</p>
                    <h3 className="text-xl font-bold text-slate-900">7.8%</h3>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-slate-400" /></div>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg. Rating</p>
                    <h3 className="text-xl font-bold text-slate-900">4.6 ★</h3>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 font-bold text-lg">★</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-900">Daily Active Users (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#2563EB', strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-900">Revenue & Orders (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={areaData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} dx={-10} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} dx={10} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.1} strokeWidth={3} />
                        <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#64748B" fill="#94A3B8" fillOpacity={0.1} strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-900">Recommendation Performance by Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }} barGap={4}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} />
                        <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="ctr" fill="#2563EB" radius={[4, 4, 0, 0]} name="CTR %" barSize={32} />
                        <Bar dataKey="conv" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Conversion %" barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-900">Top Recommended Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="h-[200px] w-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-sm font-medium text-slate-600">{d.name} <span className="text-slate-400">({d.value}%)</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-2 gap-6 pb-6">
              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl flex flex-col">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-6">
                    {[
                      { title: "New user signup spike detected", time: "10 mins ago", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                      { title: "Neural CF Model retrained successfully", time: "1 hour ago", icon: BrainCircuit, color: "text-purple-600", bg: "bg-purple-50" },
                      { title: "Large order placed ($4,200)", time: "2 hours ago", icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { title: "Anomaly detected in CTR on Home category", time: "5 hours ago", icon: ActivityIcon, color: "text-rose-600", bg: "bg-rose-50" },
                    ].map((act, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.bg}`}>
                          <act.icon className={`w-5 h-5 ${act.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{act.title}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{act.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900">AI Model Health</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Model</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Accuracy</th>
                        <th className="px-6 py-4">Inference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: "Neural CF", status: "Active", sColor: "bg-emerald-50 text-emerald-700", acc: "94.2%", inf: "45ms" },
                        { name: "Hybrid RecSys", status: "Active", sColor: "bg-emerald-50 text-emerald-700", acc: "91.8%", inf: "32ms" },
                        { name: "Content-Based", status: "Training", sColor: "bg-blue-50 text-blue-700", acc: "88.4%", inf: "12ms" },
                        { name: "Collab Filter V1", status: "Degraded", sColor: "bg-amber-50 text-amber-700", acc: "76.1%", inf: "120ms" },
                      ].map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                          <td className="px-6 py-4">
                            <Badge className={`${m.sColor} hover:${m.sColor} border-none font-bold text-xs px-2.5 py-0.5`}>{m.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{m.acc}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{m.inf}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
