import { getOrders } from "@/app/actions/checkout";
import { getBookings } from "@/app/actions/bookings";
import ClientOrders from "./client-orders";
import { auth } from "@/auth";
import Link from "next/link";
import { Suspense } from "react";

async function OrdersContainer() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
        <h2 className="text-lg font-bold text-white">অর্ডার দেখতে লগইন করুন</h2>
        <Link href="/login" className="btn btn-primary rounded-full px-6">
          লগইন করুন
        </Link>
      </div>
    );
  }

  // Fetch orders and bookings in parallel
  const [orders, bookings] = await Promise.all([getOrders(), getBookings()]);

  // Serialize dates to prevent RSC boundary issues
  const serializedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
  }));

  const serializedBookings = bookings.map((booking) => ({
    ...booking,
    date: booking.date instanceof Date ? booking.date.toISOString() : booking.date,
  }));

  return <ClientOrders initialOrders={serializedOrders} initialBookings={serializedBookings} />;
}

export default async function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-[#050811] flex-1 pb-16">
      <div className="flex flex-col gap-1 border-b border-zinc-900 pb-2">
        <h2 className="text-xl font-bold text-white tracking-wide">
          আমার অর্ডারসমূহ
        </h2>
        <p className="text-xs text-zinc-500">
          আপনার করা সকল অর্ডারের তালিকা এখানে দেখতে পাবেন।
        </p>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center text-zinc-500 text-sm">
          <span className="loading loading-spinner text-primary"></span>
          অর্ডার লোড হচ্ছে...
        </div>
      }>
        <OrdersContainer />
      </Suspense>
    </div>
  );
}
