import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, Search, Filter, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    { label: "Activity Logs", icon: Activity, active: true },
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

const logData = [
  { level: "info", time: "2024-10-30 14:22:10", type: "AUTH", msg: "User logged in", actor: "alex@example.com", ip: "192.168.1.104" },
  { level: "success", time: "2024-10-30 14:18:45", type: "USER", msg: "Email verified", actor: "maria@example.com", ip: "10.0.0.45" },
  { level: "info", time: "2024-10-30 14:15:02", type: "SYSTEM", msg: "Recommendation generated (cold start)", actor: "System", ip: "-" },
  { level: "success", time: "2024-10-30 14:10:33", type: "ADMIN", msg: "Product added: Sony WH-1000XM6", actor: "admin@recoia.ai", ip: "192.168.1.5" },
  { level: "info", time: "2024-10-30 13:55:12", type: "AUTH", msg: "Password reset requested", actor: "james@example.com", ip: "172.16.0.22" },
  { level: "warning", time: "2024-10-30 13:42:09", type: "AUTH", msg: "Failed login attempt (3rd)", actor: "unknown@spam.com", ip: "185.12.4.99" },
  { level: "success", time: "2024-10-30 13:30:00", type: "SYSTEM", msg: "AI model retrained (Hybrid Ranker v2.3)", actor: "System", ip: "-" },
  { level: "info", time: "2024-10-30 13:14:55", type: "USER", msg: "User registered", actor: "noah@example.com", ip: "192.168.1.200" },
  { level: "error", time: "2024-10-30 13:05:11", type: "SYSTEM", msg: "Recommendation service timeout (5000ms)", actor: "System", ip: "10.0.0.1" },
  { level: "success", time: "2024-10-30 12:44:21", type: "ORDER", msg: "Order placed (#ORD-8492)", actor: "emily@example.com", ip: "172.16.0.44" },
  { level: "info", time: "2024-10-30 12:30:05", type: "ADMIN", msg: "Admin action: User suspended (usr_492)", actor: "admin@recoia.ai", ip: "192.168.1.5" },
  { level: "warning", time: "2024-10-30 12:15:00", type: "SYSTEM", msg: "Low stock alert: Apple AirPods Pro (<10)", actor: "System", ip: "-" },
];

function getLevelColor(level: string) {
  switch (level) {
    case 'info': return 'bg-blue-500';
    case 'success': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-slate-500';
  }
}

export function LogsPage() {
  return (
    <AdminLayout activeLabel="Activity Logs" title="Activity Logs">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Stats Row */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-white rounded-full border border-slate-200 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
            <span className="text-slate-500 font-medium">Total Events:</span>
            <span className="font-bold text-slate-900">1,284,401</span>
          </div>
          <div className="bg-white rounded-full border border-slate-200 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
            <span className="text-slate-500 font-medium">Today:</span>
            <span className="font-bold text-blue-600">12,847</span>
          </div>
          <div className="bg-white rounded-full border border-slate-200 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
            <span className="text-slate-500 font-medium">Errors (24h):</span>
            <span className="font-bold text-red-600">23</span>
          </div>
          <div className="bg-white rounded-full border border-slate-200 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
            <span className="text-slate-500 font-medium">Warnings (24h):</span>
            <span className="font-bold text-yellow-600">156</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search logs (message, IP, actor)..." className="pl-9 bg-slate-50" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-slate-50">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="auth">AUTH</SelectItem>
                <SelectItem value="system">SYSTEM</SelectItem>
                <SelectItem value="admin">ADMIN</SelectItem>
                <SelectItem value="user">USER</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              Last 24 Hours
            </Button>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Log Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 w-8"></th>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Message</th>
                  <th className="px-6 py-4 font-medium">User/Actor</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[13px]">
                {logData.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${getLevelColor(log.level)}`}></div>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{log.time}</td>
                    <td className="px-6 py-3">
                      <span className="font-semibold text-slate-700">{log.type}</span>
                    </td>
                    <td className={`px-6 py-3 font-medium ${log.level === 'error' ? 'text-red-600' : log.level === 'warning' ? 'text-yellow-600' : 'text-slate-900'}`}>
                      {log.msg}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{log.actor}</td>
                    <td className="px-6 py-3 text-slate-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-white">
            <span className="text-sm text-slate-500 font-sans">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">12</span> of <span className="font-medium text-slate-900">1,284,401</span> logs</span>
            <div className="flex items-center gap-1 font-sans">
              <Button variant="outline" size="sm" disabled>Prev</Button>
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="px-2 text-slate-400">...</span>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
