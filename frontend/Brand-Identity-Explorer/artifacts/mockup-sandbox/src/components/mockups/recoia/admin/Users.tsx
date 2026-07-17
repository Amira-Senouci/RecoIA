import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, Search, Filter, Download, Plus, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const mockUsers = [
  { id: 1, name: "Sarah Mitchell", email: "sarah@example.com", role: "Admin", status: "Active", verified: true, fav: "Electronics", regDate: "Jan 3, 2024", lastLogin: "2 mins ago" },
  { id: 2, name: "Alex Johnson", email: "alex@example.com", role: "User", status: "Active", verified: true, fav: "Fashion", regDate: "Feb 14, 2024", lastLogin: "1 hour ago" },
  { id: 3, name: "Maria Garcia", email: "maria@example.com", role: "User", status: "Active", verified: true, fav: "Home", regDate: "Mar 7, 2024", lastLogin: "3 hours ago" },
  { id: 4, name: "James Wilson", email: "james@example.com", role: "User", status: "Suspended", verified: true, fav: "Sports", regDate: "Apr 22, 2024", lastLogin: "4 days ago" },
  { id: 5, name: "Emily Chen", email: "emily@example.com", role: "User", status: "Active", verified: true, fav: "Beauty", regDate: "May 1, 2024", lastLogin: "12 hours ago" },
  { id: 6, name: "Michael Brown", email: "michael@example.com", role: "User", status: "Pending", verified: false, fav: "Electronics", regDate: "May 18, 2024", lastLogin: "Never" },
  { id: 7, name: "Olivia Davis", email: "olivia@example.com", role: "User", status: "Active", verified: true, fav: "Books", regDate: "Jun 2, 2024", lastLogin: "2 days ago" },
  { id: 8, name: "Liam Martinez", email: "liam@example.com", role: "User", status: "Active", verified: true, fav: "Automotive", regDate: "Jun 30, 2024", lastLogin: "5 mins ago" },
  { id: 9, name: "Sophia Anderson", email: "sophia@example.com", role: "User", status: "Suspended", verified: true, fav: "Fashion", regDate: "Jul 12, 2024", lastLogin: "1 week ago" },
  { id: 10, name: "Noah Taylor", email: "noah@example.com", role: "User", status: "Active", verified: true, fav: "Electronics", regDate: "Aug 5, 2024", lastLogin: "Just now" },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('');
}

export function UsersPage() {
  return (
    <AdminLayout activeLabel="Users" title="Users">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Stats Row */}
        <div className="flex gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1 shadow-sm flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Total Users</span>
            <span className="text-2xl font-bold text-slate-900">84,291</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1 shadow-sm flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Active Users</span>
            <span className="text-2xl font-bold text-slate-900">71,840</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1 shadow-sm flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Verified Accounts</span>
            <span className="text-2xl font-bold text-slate-900">79,654</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search users..." className="pl-9 bg-slate-50" />
            </div>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-36 bg-slate-50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-roles">
              <SelectTrigger className="w-36 bg-slate-50">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-roles">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Verified</th>
                  <th className="px-6 py-4 font-medium">Favorite Category</th>
                  <th className="px-6 py-4 font-medium">Registration</th>
                  <th className="px-6 py-4 font-medium">Last Login</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockUsers.map((user, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'][i % 5]}`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-slate-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`${user.role === 'Admin' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'} hover:bg-opacity-80 border-none font-medium`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`
                        ${user.status === 'Active' ? 'bg-green-50 text-green-700' : ''}
                        ${user.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' : ''}
                        ${user.status === 'Suspended' ? 'bg-red-50 text-red-700' : ''}
                        border-none font-medium
                      `}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.verified ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-slate-400 font-bold">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.fav}</td>
                    <td className="px-6 py-4 text-slate-600">{user.regDate}</td>
                    <td className="px-6 py-4 text-slate-600">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
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
            <span className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">10</span> of <span className="font-medium text-slate-900">84,291</span> users</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>Prev</Button>
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="px-2 text-slate-400">...</span>
              <Button variant="outline" size="sm">8430</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
