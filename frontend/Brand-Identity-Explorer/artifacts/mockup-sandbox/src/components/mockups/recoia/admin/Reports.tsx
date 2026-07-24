import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, FileSpreadsheet, FileBarChart, Download, File as FileIcon, Search, Calendar, ChevronDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '../_shared/AdminLayout';


const reportTypes = [
  { id: 1, title: "User Report", desc: "Users, roles, activity summary", formats: ["CSV", "Excel", "PDF"], icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { id: 2, title: "Product Report", desc: "Inventory, sales, performance metrics", formats: ["CSV", "Excel", "PDF"], icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
  { id: 3, title: "Recommendation Report", desc: "CTR, conversion, detailed model metrics", formats: ["CSV", "PDF"], icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
  { id: 4, title: "Revenue Report", desc: "Orders, revenue, category trends", formats: ["Excel", "PDF"], icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: 5, title: "Activity Log Export", desc: "Raw dump of all admin and user actions", formats: ["CSV"], icon: Activity, color: "text-slate-600", bg: "bg-slate-100" },
  { id: 6, title: "AI Model Performance", desc: "Accuracy metrics, inference times history", formats: ["PDF"], icon: Cpu, color: "text-indigo-600", bg: "bg-indigo-50" },
];

const recentExports = [
  { name: "October_Revenue_Final.xlsx", type: "Revenue Report", author: "Sarah Mitchell", date: "Today, 10:42 AM", size: "2.4 MB", status: "Ready" },
  { name: "Rec_Model_Metrics_Q3.pdf", type: "Recommendation Report", author: "System Auto", date: "Today, 04:00 AM", size: "1.1 MB", status: "Ready" },
  { name: "All_Users_Dump_2024.csv", type: "User Report", author: "Alex Johnson", date: "Yesterday, 15:30 PM", size: "-", status: "Processing" },
  { name: "Low_Stock_Products_Nov.csv", type: "Product Report", author: "Sarah Mitchell", date: "Oct 28, 09:15 AM", size: "125 KB", status: "Ready" },
  { name: "Failed_Logins_Last30d.csv", type: "Activity Log Export", author: "System Auto", date: "Oct 25, 01:00 AM", size: "-", status: "Failed" },
];

export function ReportsPage() {
  return (
    <AdminLayout title="Reports">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Export Section Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">Generate & Export Reports</h2>
          <p className="text-slate-500 mt-1">Create on-demand data exports or configure scheduled reports.</p>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <Card key={report.id} className="border-slate-200 shadow-sm rounded-xl hover:border-blue-200 transition-colors group">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.bg}`}>
                    <report.icon className={`w-6 h-6 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 h-10">{report.desc}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {report.formats.map(fmt => (
                        <Badge key={fmt} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-2 rounded-md font-medium">
                          {fmt}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button className="flex-1 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm">
                        Generate
                      </Button>
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Download className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Exports Table */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Exports</h2>
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Report Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Generated By</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recentExports.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                        <FileIcon className="w-4 h-4 text-slate-400" />
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.type}</td>
                      <td className="px-6 py-4 text-slate-600">{item.author}</td>
                      <td className="px-6 py-4 text-slate-500">{item.date}</td>
                      <td className="px-6 py-4 text-slate-500">{item.size}</td>
                      <td className="px-6 py-4">
                        {item.status === 'Ready' && (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-none font-medium gap-1 px-2">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </Badge>
                        )}
                        {item.status === 'Processing' && (
                          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-none font-medium gap-1 px-2">
                            <Clock className="w-3 h-3 animate-spin" /> Processing
                          </Badge>
                        )}
                        {item.status === 'Failed' && (
                          <Badge variant="secondary" className="bg-red-50 text-red-700 border-none font-medium gap-1 px-2">
                            <AlertCircle className="w-3 h-3" /> Failed
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" disabled={item.status !== 'Ready'} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          Download
                        </Button>
                      </td>
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
