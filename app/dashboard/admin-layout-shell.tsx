"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  X,
  ArrowLeft,
  LayoutGrid,
  ShoppingCart,
  Sliders,
  FileText,
  LogOut,
} from "lucide-react";
import { logoutUser } from "@/app/actions/auth";

type User = {
  name?: string | null;
  email?: string | null;
  role?: string;
};

export default function AdminLayoutShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getUserInitials = () => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "A";
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
    });
  };

  // Helper to determine active page name for header
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname?.startsWith("/dashboard/categories")) return "Categories";
    if (pathname?.startsWith("/dashboard/products")) return "Products";
    if (pathname?.startsWith("/dashboard/services")) return "Services";
    if (pathname?.startsWith("/dashboard/orders")) return "Orders";
    return "Admin Panel";
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
    { href: "/dashboard/categories", label: "Categories", icon: LayoutGrid },
    { href: "/dashboard/products", label: "Products", icon: ShoppingCart },
    { href: "/dashboard/services", label: "Services", icon: Sliders },
    { href: "/dashboard/orders", label: "Orders", icon: FileText },
  ];

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-base-100 text-base-content flex-1">
      {/* 1. Header Row */}
      <div className="w-full bg-base-200 px-4 py-4 flex items-center justify-between border-b border-base-300/30 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-base-content/60 hover:text-base-content transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-base-content font-bold text-base tracking-tight">
            {getPageTitle()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative text-base-content/60 hover:text-base-content transition-colors p-1">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 bg-secondary w-2 h-2 rounded-full"></span>
          </button>

          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-accent flex items-center justify-center text-[#111] font-bold text-xs shadow-sm"
          >
            {getUserInitials()}
          </Link>
        </div>
      </div>

      {/* 2. Drawer Navigation Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-start">
          <div className="w-[280px] h-full bg-base-200 border-r border-base-300/40 flex flex-col justify-between p-5 animate-slide-right">
            {/* Top drawer section */}
            <div className="flex flex-col gap-6">
              {/* Brand Logo Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg">
                    <span className="text-primary-content font-bold text-xs">DC</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm leading-tight">
                      Dream Care
                    </span>
                    <span className="text-[10px] text-base-content/40 font-bold leading-none">
                      Admin Panel
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-base-content/40 hover:text-base-content transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Back to Home Button */}
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 bg-base-300 text-base-content rounded-xl hover:text-base-content transition-all text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>

              {/* Menu List */}
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-widest pl-3 mb-1">
                  Menu
                </span>

                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-secondary/10 text-secondary border-l-2 border-secondary"
                          : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_var(--color-secondary)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom profile info & logout */}
            <div className="flex flex-col gap-4 border-t border-base-300/30 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-secondary to-accent flex items-center justify-center text-[#111] font-bold text-xs">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-xs truncate max-w-[100px]">
                      {user.name}
                    </span>
                    <span className="text-[8px] bg-secondary/15 text-secondary px-1 py-0.5 rounded font-extrabold whitespace-nowrap">
                      সুপার এডমিন
                    </span>
                  </div>
                  <span className="text-[10px] text-base-content/40 truncate w-36">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isPending}
                className="btn btn-sm bg-[#e11d48]/10 hover:bg-[#e11d48]/20 text-[#f43f5e] border-none rounded-xl text-xs py-2 w-full flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="flex-1 h-full"
            onClick={() => setDrawerOpen(false)}
          />
        </div>
      )}

      {/* Main children area */}
      <div className="flex flex-col flex-1 w-full relative">{children}</div>
    </div>
  );
}
