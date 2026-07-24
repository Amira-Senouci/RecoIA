import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings,
  Bell, LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, type AdminNotification } from "@/lib/api";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ADMIN_NAV = [
  { group: "Overview", items: [{ label: "Dashboard", icon: LayoutDashboard, to: "/admin" }] },
  { group: "Data", items: [
    { label: "Users", icon: Users, to: "/admin/users" },
    { label: "Products", icon: Package, to: "/admin/products" },
    { label: "Categories", icon: Tag, to: "/admin/categories" },
    { label: "Orders", icon: ShoppingBag, to: "/admin/orders" },
  ]},
  { group: "AI", items: [
    { label: "Recommendations", icon: Sparkles, to: "/admin/recommendations" },
    { label: "AI Models", icon: Cpu, to: "/admin/models" },
  ]},
  { group: "Insights", items: [
    { label: "Analytics", icon: BarChart2, to: "/admin/analytics" },
    { label: "Reports", icon: FileText, to: "/admin/reports" },
    { label: "Activity Logs", icon: Activity, to: "/admin/logs" },
  ]},
  { group: "System", items: [{ label: "Settings", icon: Settings, to: "/admin/settings" }] },
];

function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <path strokeLinecap="round" strokeWidth="2" d="M12 3v2M12 19v2M3 12h2M19 12h2" />
            </svg>
          </div>
          <div>
            <div className="text-white font-semibold text-base leading-none">RecoIA</div>
            <div className="text-slate-500 text-xs mt-0.5">Admin Console</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {ADMIN_NAV.map((group) => (
          <div key={group.group}>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">{group.group}</p>
            {group.items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                    active ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(user?.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.email ?? "Admin"}</p>
            <p className="text-slate-500 text-xs truncate">Super Admin</p>
          </div>
          <button onClick={logout} className="text-slate-500 hover:text-white" type="button" aria-label="Log out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminNotifications()
      .then((res) => {
        if (!cancelled) setNotifications(res.notifications);
      })
      .catch(() => {
        // best-effort -- an empty bell is a reasonable fallback
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-slate-100" type="button" aria-label="Notifications">
          <Bell className="w-5 h-5 text-slate-600" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>New users this week</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-sm text-slate-500 text-center">No new signups in the last 7 days.</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
              <span className="text-sm font-medium text-slate-900">{n.email}</span>
              <span className="text-xs text-slate-500">{n.created_at ?? "just now"}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
        <NotificationBell />
      </div>
    </header>
  );
}

export function AdminLayout({
  children,
  title,
  breadcrumb,
}: {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminTopbar title={title} breadcrumb={breadcrumb} />
        <main className="flex-1 pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
