"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/checkout";
import { formatBengaliDate } from "@/app/orders/client-orders";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  weeklyStats: { day: string; count: number }[];
};

type RecentOrder = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: Date | string;
  user: { name: string | null };
  items: { product: { name: string } }[];
};


export default function AdminDashboard({
  stats,
  recentOrders,
}: {
  stats: Stats;
  recentOrders: RecentOrder[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [orders, setOrders] = useState<RecentOrder[]>(recentOrders);

  const handleStatusChange = (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PENDING" ? "DELIVERED" : "PENDING";
    const nextPaymentStatus = nextStatus === "DELIVERED" ? "PAID" : "PENDING";

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus, nextPaymentStatus);
      if (result.success && result.order) {
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: nextStatus } : o
          )
        );
        router.refresh();
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  const maxWeeklyCount = Math.max(...stats.weeklyStats.map((s) => s.count), 1);

  return (
    <div className="px-4 py-4 flex flex-col gap-6 pb-8">
      {/* KPI Grid (Image 7) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Orders */}
        <div className="bg-base-200 border border-base-300/30 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] text-base-content/50 font-bold uppercase">Total Orders</span>
            <span className="text-xl font-extrabold text-base-content">{stats.totalOrders}</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +100%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500 border border-violet-500/10 shadow-[0_0_12px_rgba(139,92,246,0.1)]">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-base-200 border border-base-300/30 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] text-base-content/50 font-bold uppercase">Revenue</span>
            <span className="text-[15px] font-extrabold text-base-content truncate w-24">
              ৳ {stats.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +100%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-base-200 border border-base-300/30 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] text-base-content/50 font-bold uppercase">Total Users</span>
            <span className="text-xl font-extrabold text-base-content">{stats.totalUsers}</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +100%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4] border border-[#06b6d4]/10 shadow-[0_0_12px_rgba(6,182,212,0.1)]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-base-200 border border-base-300/30 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] text-base-content/50 font-bold uppercase">Pending Orders</span>
            <span className="text-xl font-extrabold text-base-content">{stats.pendingOrders}</span>
            <span className="text-[10px] text-base-content/40 font-bold">Stable</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eab308]/10 flex items-center justify-center text-[#eab308] border border-[#eab308]/10 shadow-[0_0_12px_rgba(234,179,8,0.1)]">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Weekly Orders Volume Bar Chart (Image 8) */}
      <div className="bg-base-200 border border-base-300/30 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-base-content tracking-wide">Weekly Orders</span>
            <span className="text-[10px] text-base-content/50">Order volume over the past week</span>
          </div>
          <span className="badge badge-sm bg-[#10b981]/15 text-[#10b981] border-none font-bold text-[9px] rounded-md px-1.5 py-2">
            Active
          </span>
        </div>

        {/* CSS-based Bar Chart */}
        <div className="flex items-end justify-between h-36 px-2 pt-6 border-b border-base-300/20">
          {stats.weeklyStats.map((item, i) => {
            const heightPct = Math.max((item.count / maxWeeklyCount) * 100, 3); // minimum 3% height for styling
            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                {/* Hover count indicator above bar */}
                {item.count > 0 && (
                  <span className="text-[9px] font-extrabold text-white bg-secondary/15 text-secondary px-1 py-0.5 rounded leading-none">
                    {item.count}
                  </span>
                )}
                {/* Dynamic Height bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-4.5 rounded-t-lg transition-all ${
                    item.count > 0
                      ? "bg-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      : "bg-base-300"
                  }`}
                />
                <span className="text-[9px] text-base-content/40 font-bold">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Orders List (Image 8 & 9) */}
      <div className="bg-base-200 border border-base-300/30 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
        <div className="flex items-center justify-between border-b border-base-300/20 pb-3">
          <span className="text-xs font-bold text-base-content tracking-wide">Recent Orders</span>
          <Link href="/dashboard/orders" className="text-[10px] font-bold text-secondary hover:underline flex items-center gap-0.5">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Orders Log */}
        <div className="flex flex-col gap-3">
          {orders.map((ord) => {
            const firstItem = ord.items[0];
            const isPending = ord.status === "PENDING";

            return (
              <div
                key={ord.id}
                className="flex items-center justify-between p-3.5 bg-base-300/30 border border-base-300/20 rounded-xl"
              >
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-base-content/60">#{ord.id}</span>
                    {/* Toggle status indicator on click */}
                    <button
                      onClick={() => handleStatusChange(ord.id, ord.status)}
                      disabled={isPending}
                      className={`badge badge-xs font-bold text-[8px] rounded px-1.5 py-1 transition-all ${
                        ord.status === "DELIVERED"
                          ? "bg-[#059669] text-white border-none"
                          : "bg-warning/20 text-warning border border-base-300/30 hover:bg-warning/30"
                      }`}
                    >
                      {ord.status === "PENDING" ? "Pending" : "Delivered"}
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-base-content line-clamp-1 leading-snug">
                    {firstItem ? firstItem.product.name : "Order"}
                  </span>
                  <span className="text-[9px] text-base-content/40 font-medium">
                    Customer: {ord.user.name || "Guest"} • {formatBengaliDate(ord.createdAt)}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-extrabold text-secondary">
                    ৳ {ord.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-base-content/30">
                    {isPending ? "Click to Complete" : "Completed"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
