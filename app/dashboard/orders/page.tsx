import { getOrders } from "@/app/actions/checkout";
import { getBookings } from "@/app/actions/bookings";
import ClientOrdersManagement from "./client-orders-management";
import type { Order, Booking } from "./client-orders-management";
import { Suspense } from "react";

async function OrdersContainer() {
  // Fetch orders and bookings in parallel using the admin-permissioned action functions
  const [orders, bookings] = await Promise.all([getOrders(), getBookings()]);

  // Serialize dates to prevent RSC boundary issues
  const serializedOrders: Order[] = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
    shippingAddress: order.shippingAddress,
    city: order.city,
    mobile: order.mobile,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    totalAmount: order.totalAmount,
    user: {
      name: order.user?.name || null,
      email: order.user?.email || null,
    },
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: {
        name: item.product.name,
      },
    })),
  }));

  const serializedBookings: Booking[] = bookings.map((booking) => ({
    id: booking.id,
    date: booking.date instanceof Date ? booking.date.toISOString() : String(booking.date),
    timeSlot: booking.timeSlot,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    status: booking.status,
    user: {
      name: booking.user?.name || null,
      email: booking.user?.email || null,
      mobile: booking.user?.mobile || null,
    },
    service: {
      name: booking.service.name,
      price: booking.service.price,
      duration: booking.service.duration,
    },
  }));

  return (
    <ClientOrdersManagement
      initialOrders={serializedOrders}
      initialBookings={serializedBookings}
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
