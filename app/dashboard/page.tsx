import prisma from "@/lib/prisma";
import AdminDashboard from "./admin-dashboard";
import { Suspense } from "react";
import { auth } from "@/auth";
import { cacheLife, cacheTag } from "next/cache";

async function getDashboardData() {
  "use cache";
  cacheTag("orders", "products", "services", "users");
  cacheLife("minutes");

  const [totalOrders, totalUsers, pendingOrders, allOrders] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const completedOrders = await prisma.order.findMany({
    select: { totalAmount: true },
  });

  return {
    totalOrders,
    totalUsers,
    pendingOrders,
    allOrders,
    completedOrders,
  };
}

async function AdminDashboardContainer() {
  const session = await auth();
  if (!session?.user) return null;

  const { totalOrders, totalUsers, pendingOrders, allOrders, completedOrders } = await getDashboardData();
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyStats = daysOfWeek.map((day) => ({ day, count: 0 }));

  allOrders.forEach((order) => {
    const orderDay = new Date(order.createdAt).getDay();
    const dayName = daysOfWeek[orderDay];
    const stat = weeklyStats.find((s) => s.day === dayName);
    if (stat) stat.count += 1;
  });

  const orderedDays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const sortedWeeklyStats = orderedDays.map((day) => {
    const found = weeklyStats.find((s) => s.day === day);
    return {
      day,
      count: found ? found.count : 0,
    };
  });

  const serializedRecentOrders = allOrders.slice(0, 5).map((order) => ({
    ...order,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    items: order.items.map((item) => ({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    })),
  }));

  return (
    <AdminDashboard
      stats={{
        totalOrders,
        totalRevenue,
        totalUsers,
        pendingOrders,
        weeklyStats: sortedWeeklyStats,
      }}
      recentOrders={serializedRecentOrders}
      user={session.user!}
    />
  );
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-base-100 flex-1 text-center">
        <h2 className="text-lg font-bold text-base-content animate-pulse">ড্যাশবোর্ড লোড হচ্ছে...</h2>
      </div>
    }>
      <AdminDashboardContainer />
    </Suspense>
  );
}
