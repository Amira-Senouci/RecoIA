import React from "react";
import { Search, Bell, ShoppingCart, User, Menu, Home, Compass, Sparkles, Heart, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 w-full z-30 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <Logo />
      </div>
      
      <div className="hidden lg:flex items-center w-[240px]">
        <Logo />
      </div>

      <div className="flex-1 max-w-2xl px-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search products, brands, and categories..." 
            className="w-full bg-slate-50 border-slate-200 pl-9 pr-4 rounded-full focus-visible:ring-blue-600 shadow-none h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5 text-slate-600" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600 border-none">3</Badge>
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></div>
        </Button>
        <div className="w-9 h-9 rounded-full bg-slate-200 ml-2 border border-slate-200 overflow-hidden shrink-0 cursor-pointer">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const links = [
    { name: "Home", icon: Home, active: true },
    { name: "Browse", icon: Compass },
    { name: "Recommendations", icon: Sparkles },
    { name: "Favorites", icon: Heart },
    { name: "Orders", icon: Package },
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-[240px] hidden lg:flex flex-col border-r border-slate-200 bg-white fixed left-0 top-16 h-[calc(100vh-64px)] z-20">
      <div className="py-6 px-4 flex-1 overflow-y-auto">
        <nav className="space-y-1.5">
          {links.map((link) => (
            <a 
              key={link.name} 
              href="#" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                link.active 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <link.icon className={`h-4.5 w-4.5 ${link.active ? "text-blue-600" : "text-slate-400"}`} />
              {link.name}
            </a>
          ))}
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
