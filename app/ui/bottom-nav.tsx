"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, FileText, User, Settings } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide bottom nav on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const navItems = [
    {
      label: "হোম",
      path: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "ক্যাটাগরি",
      path: "/categories",
      icon: LayoutGrid,
      isActive: pathname === "/categories",
    },
    {
      label: "আমার অর্ডার",
      path: "/orders",
      icon: FileText,
      isActive: pathname === "/orders",
    },
    {
      label: "প্রোফাইল",
      path: "/profile",
      icon: User,
      isActive: pathname === "/profile",
    },
    ...(isAdmin
      ? [
          {
            label: "ড্যাশবোর্ড",
            path: "/dashboard",
            icon: Settings,
            isActive: pathname === "/dashboard" || pathname?.startsWith("/dashboard/"),
          },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-base-200 border-t border-base-300/30 flex items-center justify-around py-2 z-40">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center flex-1 relative py-1 text-[11px] transition-all duration-200 select-none ${
              item.isActive
                ? "text-secondary font-medium"
                : "text-base-content/40 hover:text-base-content/70"
            }`}
          >
            {/* Active Top Bar Indicator */}
            {item.isActive && (
              <div className="absolute top-0 w-8 h-1 bg-secondary rounded-full shadow-[0_0_8px_var(--color-secondary)]" />
            )}

            {/* Icon */}
            <IconComponent className={`w-5 h-5 mb-1 ${item.isActive ? "scale-105" : ""}`} />

            {/* Label */}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
