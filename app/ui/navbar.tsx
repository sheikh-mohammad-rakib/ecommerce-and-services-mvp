"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { ShoppingCart, Bell, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserNotifications } from "@/app/actions/notifications";

let notifCache: { count: number; ts: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchVal, setSearchVal] = useState(searchParams.get("q") || "");
  const [brandVal, setBrandVal] = useState(searchParams.get("brand") || "");

  // Fetch unread notifications count
  useEffect(() => {
    if (!session?.user) return;
    const now = Date.now();
    if (notifCache && now - notifCache.ts < CACHE_TTL) {
      Promise.resolve(notifCache.count).then((count) => setUnreadCount(count));
      return;
    }
    getUserNotifications().then((notes) => {
      const unread = notes.filter((n) => !n.isRead).length;
      notifCache = { count: unread, ts: Date.now() };
      setUnreadCount(unread);
    });
  }, [session, pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal) {
      params.set("q", searchVal);
    } else {
      params.delete("q");
    }

    if (pathname === "/products" || pathname === "/services" || pathname === "/categories") {
      router.push(`${pathname}?${params.toString()}`);
    } else {
      // Default search redirects to products
      router.push(`/products?${params.toString()}`);
    }
  };

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (brandVal) {
      params.set("brand", brandVal);
    } else {
      params.delete("brand");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Extract first letter of name
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    return "";
  };

  // Hide header on login/register and admin dashboard pages to match mobile screens
  if (pathname === "/login" || pathname === "/register" || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="w-full bg-base-200 px-4 pt-3 pb-2 flex flex-col gap-3 sticky top-0 z-40 border-b border-base-300/20">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-lg shadow-[0_0_12px_var(--color-primary)]">
            <span className="text-primary-content font-bold text-base">DC</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Dream Care</span>
        </Link>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          {/* Cart Indicator */}
          <Link href="/cart" className="relative p-1 text-base-content/60 hover:text-base-content transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-content text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-base-200">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Notifications Bell */}
          <Link href="/notifications" className="relative p-1 text-base-content/60 hover:text-base-content transition-colors">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-secondary w-2.5 h-2.5 rounded-full border border-base-200 animate-pulse"></span>
            )}
          </Link>

          {/* User Profile initials / Login link */}
          {session?.user ? (
            <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-accent flex items-center justify-center text-[#111] font-bold text-sm shadow-[0_0_8px_var(--color-secondary)]">
              {getUserInitials()}
            </Link>
          ) : (
            <Link href="/login" className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-base-content hover:bg-base-300/80">
              <User className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="flex flex-col gap-2">
        {/* Search 1: Product / Service search */}
        {pathname !== "/categories" && (
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="পণ্য বা সার্ভিস খুঁজুন..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-base-300 text-base-content placeholder-base-content/40 rounded-lg py-2 pl-4 pr-10 text-sm border border-base-300 focus:outline-none focus:border-primary transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content">
              <Search className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Search 2: Brand / Product search (Only on categories page as per Image 3) */}
        {pathname === "/categories" && (
          <form onSubmit={handleBrandSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="পণ্য বা ব্র্যান্ড খুঁজুন..."
              value={brandVal}
              onChange={(e) => setBrandVal(e.target.value)}
              className="w-full bg-base-300 text-base-content placeholder-base-content/40 rounded-lg py-2 pl-4 pr-10 text-sm border border-base-300 focus:outline-none focus:border-primary transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content">
              <Search className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
