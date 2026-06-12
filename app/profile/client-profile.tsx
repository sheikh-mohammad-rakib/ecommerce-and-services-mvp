"use client";

import { useTransition, useState } from "react";
import { logoutUser } from "@/app/actions/auth";
import { MapPin, CreditCard, Heart, Settings, HelpCircle, Globe, ChevronRight, LogOut } from "lucide-react";

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export default function ClientProfile({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<"bn" | "en">("bn");

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
    });
  };

  const getUserInitials = () => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const menuItems = [
    {
      label: "আমার ঠিকানা",
      icon: MapPin,
    },
    {
      label: "পেমেন্ট পদ্ধতি",
      icon: CreditCard,
    },
    {
      label: "উইশলিস্ট",
      icon: Heart,
    },
    {
      label: "অ্যাকাউন্ট সেটিংস",
      icon: Settings,
    },
    {
      label: "সহায়তা ও সাপোর্ট",
      icon: HelpCircle,
    },
  ];

  const roleLabel = user.role === "ADMIN" ? "সুপার এডমিন" : "গ্রাহক";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* User Info Header */}
      <div className="flex flex-col items-center gap-2 py-4">
        {/* Initials Badge */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-secondary to-accent flex items-center justify-center text-[#111] font-bold text-2xl shadow-[0_0_15px_oklch(84%_0.143_164.978)] select-none">
          {getUserInitials()}
        </div>

        {/* User Name */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-white">{user.name}</span>
          <span className="badge badge-sm bg-[#059669]/20 text-secondary border-none font-bold rounded-md px-1.5 py-2">
            {roleLabel}
          </span>
        </div>

        {/* Email */}
        <span className="text-xs text-zinc-400 select-all">{user.email}</span>
      </div>

      {/* Menu List */}
      <div className="flex flex-col bg-[#0d1222] border border-zinc-800/40 rounded-2xl overflow-hidden divide-y divide-zinc-900/60 shadow-md">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="flex items-center justify-between px-4 py-3.5 text-zinc-300 hover:text-white hover:bg-[#111827] transition-all text-left w-full"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4.5 h-4.5 text-zinc-400" />
                <span className="text-xs font-bold">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          );
        })}

        {/* Language switcher tab row */}
        <div className="flex items-center justify-between px-4 py-3 text-zinc-300 w-full">
          <div className="flex items-center gap-3">
            <Globe className="w-4.5 h-4.5 text-zinc-400" />
            <span className="text-xs font-bold">ভাষা / Language</span>
          </div>

          <div className="bg-[#0b0f19] border border-zinc-800 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setLanguage("bn")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                language === "bn"
                  ? "bg-secondary text-secondary-content"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                language === "en"
                  ? "bg-secondary text-secondary-content"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="btn bg-secondary hover:bg-secondary/80 text-secondary-content border-none w-full rounded-2xl flex items-center justify-center gap-2 text-xs py-3 mt-4 shadow-md font-bold"
      >
        <LogOut className="w-4.5 h-4.5" />
        {isPending ? "লগ আউট হচ্ছে..." : "লগ আউট"}
      </button>
    </div>
  );
}
