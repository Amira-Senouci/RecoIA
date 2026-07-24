import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, Search, Filter, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '../_shared/AdminLayout';


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
    <AdminLayout title="Activity Logs">
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
