import { getOrders } from "@/app/actions/checkout";
import { getBookings } from "@/app/actions/bookings";
import ClientOrdersManagement from "./client-orders-management";
import { Suspense } from "react";

async function OrdersContainer() {
  // Fetch orders and bookings in parallel using the admin-permissioned action functions
  const [orders, bookings] = await Promise.all([getOrders(), getBookings()]);

  // Serialize dates to prevent RSC boundary issues
  const serializedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    items: order.items.map((item) => ({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    })),
  }));

  const serializedBookings = bookings.map((booking) => ({
    ...booking,
    date: booking.date instanceof Date ? booking.date.toISOString() : booking.date,
  }));

  return (
    <ClientOrdersManagement
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialOrders={serializedOrders as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialBookings={serializedBookings as any}
    />
  );
}

export default async function DashboardOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-base-100 flex-1 text-center">
          <span className="loading loading-spinner text-primary"></span>
          <h2 className="text-sm font-bold text-base-content/60">অর্ডার ও বুকিং লোড হচ্ছে...</h2>
        </div>
      }
    >
      <OrdersContainer />
    </Suspense>
  );
}
