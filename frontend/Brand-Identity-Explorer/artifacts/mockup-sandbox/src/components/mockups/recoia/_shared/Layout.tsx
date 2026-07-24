import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, User, Menu, Home, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span className="font-semibold text-xl tracking-tight text-slate-900">RecoIA</span>
    </div>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearchSubmit(event: React.FormEvent): void {
    event.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 w-full z-30 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/home"><Logo /></Link>
      </div>

      <div className="hidden lg:flex items-center w-[240px]">
        <Link to="/home"><Logo /></Link>
      </div>

      <form className="flex-1 max-w-2xl px-6" onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products, brands, and categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border-slate-200 pl-9 pr-4 rounded-full focus-visible:ring-blue-600 shadow-none h-10"
          />
        </div>
      </form>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
        </Button>
        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80">
          <span className="hidden sm:block text-sm font-medium text-slate-600">{user?.email}</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(user?.email ?? "?").charAt(0).toUpperCase()}
          </div>
        </Link>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
          <LogOut className="h-5 w-5 text-slate-600" />
        </Button>
      </div>
    </header>
  );
}

export function Sidebar() {
  const location = useLocation();
  const links = [
    { name: "Home", icon: Home, to: "/home" },
    { name: "Search", icon: Search, to: "/search" },
    { name: "Favorites", icon: Heart, to: "/favorites" },
    { name: "Profile", icon: User, to: "/profile" },
  ];

  return (
    <aside className="w-[240px] hidden lg:flex flex-col border-r border-slate-200 bg-white fixed left-0 top-16 h-[calc(100vh-64px)] z-20">
      <div className="py-6 px-4 flex-1 overflow-y-auto">
        <nav className="space-y-1.5">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.name}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <link.icon className={`h-4.5 w-4.5 ${active ? "text-blue-600" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 lg:ml-[240px] p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
