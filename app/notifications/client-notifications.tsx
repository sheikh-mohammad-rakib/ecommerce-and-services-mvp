"use client";

import { useState, useTransition, useEffect } from "react";
import { Truck, Megaphone, Package, CheckCircle, BellRing, BellOff } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";

// Helper to convert numbers to Bengali digits
function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
}

// Helper to convert timestamps to Bengali time-ago format
function formatBengaliTimeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "এইমাত্র";
  if (diffMin < 60) return `${toBengaliNumber(diffMin)} মিনিট আগে`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${toBengaliNumber(diffHours)} ঘণ্টা আগে`;

  const diffDays = Math.floor(diffHours / 24);
  return `${toBengaliNumber(diffDays)} দিন আগে`;
}

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string; // DELIVERY, PROMO, CONFIRM, SYSTEM
  isRead: boolean;
  createdAt: Date | string;
};

export default function ClientNotifications({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsRead();
      if (res.success) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      }
    });
  };

  const handleMarkSingleRead = (id: string, isAlreadyRead: boolean) => {
    if (isAlreadyRead) return;
    startTransition(async () => {
      const res = await markNotificationRead(id);
      if (res.success) {
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    });
  };

  // Filter list
  const filteredList = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    return true; // "all"
  });

  const getNotificationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "DELIVERY":
        return Truck;
      case "PROMO":
        return Megaphone;
      case "CONFIRM":
        return Package;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Title block with "Mark all as read" */}
      <div className="flex items-start justify-between border-b border-zinc-900 pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold text-white tracking-wide">নোটিফিকেশন</h2>
          </div>
          <p className="text-xs text-zinc-400">
            {unreadCount > 0
              ? `${toBengaliNumber(unreadCount)}টি অপঠিত বার্তা আছে`
              : "সব বার্তা পড়া হয়েছে"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs font-bold text-secondary hover:underline disabled:opacity-50"
          >
            সব পঠিত করুন
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#0d1222] border border-zinc-950 p-1.5 rounded-full items-center mb-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === "all"
              ? "bg-[#1f293d] text-white shadow"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          সব ({toBengaliNumber(notifications.length)})
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === "unread"
              ? "bg-[#1f293d] text-white shadow"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          অপঠিত ({toBengaliNumber(unreadCount)})
        </button>
      </div>

      {filteredList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
          <BellOff className="w-12 h-12 text-zinc-800" />
          <span className="text-xs">কোন নোটিফিকেশন নেই।</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {filteredList.map((note) => {
          const Icon = getNotificationIcon(note.type);
          return (
            <button
              key={note.id}
              onClick={() => handleMarkSingleRead(note.id, note.isRead)}
              className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                note.isRead
                  ? "bg-[#0b0f19]/40 border-zinc-900/60 text-zinc-400"
                  : "bg-[#0d1222] border-zinc-800/80 text-zinc-100 hover:bg-[#111827]"
              }`}
            >
              {/* Left Circle Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  note.isRead
                    ? "bg-[#0a0d17] text-zinc-600"
                    : "bg-[#0e1424] text-secondary border border-zinc-800"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Message Details */}
              <div className="flex flex-col gap-1 flex-1">
                <h4 className={`text-xs font-bold ${note.isRead ? "text-zinc-400" : "text-white"}`}>
                  {note.title}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-normal">{note.message}</p>
                <span className="text-[9px] text-zinc-500 font-semibold mt-1">
                  {mounted ? formatBengaliTimeAgo(note.createdAt) : ""}
                </span>
              </div>

              {/* Active Dot */}
              {!note.isRead && (
                <div className="w-2 h-2 rounded-full bg-secondary self-center shadow-[0_0_8px_oklch(84%_0.143_164.978)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
