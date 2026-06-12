"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Package, Calendar, Clock, MapPin, Phone, User as UserIcon } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/checkout";
import { updateBookingStatus } from "@/app/actions/bookings";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
};

export type Order = {
  id: string;
  createdAt: string;
  shippingAddress: string | null;
  city: string | null;
  mobile: string | null;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  totalAmount: number;
  user: {
    name: string | null;
    email: string | null;
  };
  items: OrderItem[];
};

export type Booking = {
  id: string;
  date: string;
  timeSlot: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  user: {
    name: string | null;
    email: string | null;
    mobile?: string | null;
  };
  service: {
    name: string;
    price: number;
    duration: number;
  };
};

export default function ClientOrdersManagement({
  initialOrders,
  initialBookings,
}: {
  initialOrders: Order[];
  initialBookings: Booking[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"orders" | "bookings">("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleOrderStatusChange = (orderId: string, status: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status);
      if (res.error) {
        alert(res.error);
      } else {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
        router.refresh();
      }
    });
  };

  const handleOrderPaymentChange = (orderId: string, paymentStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, order.status, paymentStatus);
      if (res.error) {
        alert(res.error);
      } else {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o)));
        router.refresh();
      }
    });
  };

  const handleBookingStatusChange = (bookingId: string, status: string) => {
    startTransition(async () => {
      const res = await updateBookingStatus(bookingId, status);
      if (res.error) {
        alert(res.error);
      } else {
        setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)));
        router.refresh();
      }
    });
  };

  const handleBookingPaymentChange = (bookingId: string, paymentStatus: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    startTransition(async () => {
      const res = await updateBookingStatus(bookingId, booking.status, paymentStatus);
      if (res.error) {
        alert(res.error);
      } else {
        setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, paymentStatus } : b)));
        router.refresh();
      }
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.mobile || "").includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" ? true : o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" ? true : b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-4 py-6 flex flex-col gap-6 pb-16 bg-base-100 flex-1">
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-base-300/30 pb-3">
        <h2 className="text-xl font-bold text-base-content tracking-wide">
          অর্ডার ও বুকিং ম্যানেজমেন্ট
        </h2>
        <p className="text-xs text-base-content/50">
          গ্রাহকদের করা অর্ডার এবং সার্ভিস বুকিং সমূহের বর্তমান অবস্থা পরিবর্তন ও তদারকি করুন।
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1 rounded-xl w-full flex">
        <button
          onClick={() => {
            setActiveTab("orders");
            setStatusFilter("ALL");
          }}
          className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "orders" ? "bg-primary text-primary-content shadow" : "text-base-content/60"
          }`}
        >
          পণ্য অর্ডার ({orders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("bookings");
            setStatusFilter("ALL");
          }}
          className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "bookings" ? "bg-primary text-primary-content shadow" : "text-base-content/60"
          }`}
        >
          সার্ভিস বুকিং ({bookings.length})
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder={
              activeTab === "orders"
                ? "অর্ডার আইডি, কাস্টমার নাম বা মোবাইল নম্বর..."
                : "বুকিং আইডি, কাস্টমার নাম বা সার্ভিস..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-base-200 text-base-content placeholder-base-content/40 rounded-xl py-2.5 pl-4 pr-10 text-xs border border-base-300/30 focus:outline-none focus:border-primary transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`btn btn-xs rounded-lg font-bold ${
              statusFilter === "ALL" ? "btn-secondary" : "btn-ghost text-base-content/50"
            }`}
          >
            সব
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`btn btn-xs rounded-lg font-bold ${
              statusFilter === "PENDING" ? "btn-secondary" : "btn-ghost text-base-content/50"
            }`}
          >
            পেন্ডিং
          </button>
          <button
            onClick={() => setStatusFilter("CONFIRMED")}
            className={`btn btn-xs rounded-lg font-bold ${
              statusFilter === "CONFIRMED" ? "btn-secondary" : "btn-ghost text-base-content/50"
            }`}
          >
            কনফার্মড
          </button>
          {activeTab === "orders" && (
            <>
              <button
                onClick={() => setStatusFilter("SHIPPED")}
                className={`btn btn-xs rounded-lg font-bold ${
                  statusFilter === "SHIPPED" ? "btn-secondary" : "btn-ghost text-base-content/50"
                }`}
              >
                শিপড
              </button>
              <button
                onClick={() => setStatusFilter("DELIVERED")}
                className={`btn btn-xs rounded-lg font-bold ${
                  statusFilter === "DELIVERED" ? "btn-secondary" : "btn-ghost text-base-content/50"
                }`}
              >
                ডেলিভারড
              </button>
            </>
          )}
          <button
            onClick={() => setStatusFilter("CANCELLED")}
            className={`btn btn-xs rounded-lg font-bold ${
              statusFilter === "CANCELLED" ? "btn-secondary" : "btn-ghost text-base-content/50"
            }`}
          >
            বাতিল
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="flex flex-col gap-4">
        {activeTab === "orders" ? (
          filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-xs text-base-content/40 bg-base-200 border border-base-300/20 rounded-2xl flex flex-col items-center justify-center gap-2">
              <Package className="w-8 h-8 text-base-content/20" />
              কোন পণ্য অর্ডার পাওয়া যায়নি
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-base-200 border border-base-300/30 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-base-300/20 pb-2 relative z-10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-base-content">
                      অর্ডার #{order.id}
                    </span>
                    <span className="text-[10px] text-base-content/40 font-medium">
                      তারিখ: {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Order Status Selector */}
                    <div className="dropdown dropdown-end relative z-20">
                      <div
                        tabIndex={0}
                        role="button"
                        className={`badge badge-sm font-bold text-[9px] rounded px-2 py-1 flex items-center gap-1 cursor-pointer transition-all ${
                          order.status === "DELIVERED"
                            ? "bg-success text-success-content"
                            : order.status === "CANCELLED"
                            ? "bg-error text-white"
                            : "bg-warning/25 text-warning"
                        }`}
                      >
                        {order.status} <ChevronDown className="w-2.5 h-2.5" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-1.5 shadow-xl bg-base-300 border border-base-300 rounded-xl w-32 text-[10px] z-50 mt-1 gap-1"
                      >
                        {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                          <li key={status}>
                            <button
                              disabled={isPending}
                              onClick={() => handleOrderStatusChange(order.id, status)}
                              className={`px-2 py-1.5 rounded-lg text-left w-full ${
                                order.status === status ? "bg-primary text-primary-content font-bold" : "hover:bg-base-200"
                              }`}
                            >
                              {status}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-wider">
                    পণ্য তালিকা
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-base-content font-medium">
                          {item.product.name} <span className="text-base-content/40">x{item.quantity}</span>
                        </span>
                        <span className="text-base-content/60 font-semibold">
                          ৳ {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address & Payment Info */}
                <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-base-300/20 pt-3">
                  <div className="flex flex-col gap-1 text-base-content/60">
                    <span className="font-bold text-base-content/40">ডেলিভারি ঠিকানা</span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 flex-shrink-0" /> {order.user.name || "Guest User"}
                    </span>
                    {order.mobile && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0" /> {order.mobile}
                      </span>
                    )}
                    {(order.shippingAddress || order.city) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> {order.shippingAddress}, {order.city}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-right items-end">
                    <span className="font-bold text-base-content/40 text-left w-full text-right">পেমেন্ট বিবরণ</span>
                    <span className="text-base-content font-bold">
                      পদ্ধতি: {order.paymentMethod === "CASH_ON_DELIVERY" ? "ক্যাশ অন ডেলিভারি" : order.paymentMethod}
                    </span>
                    
                    {/* Payment Status Dropdown */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-base-content/40 font-medium">পেমেন্ট অবস্থা:</span>
                      <div className="dropdown dropdown-end relative z-20">
                        <div
                          tabIndex={0}
                          role="button"
                          className={`badge badge-sm font-bold text-[9px] rounded px-2 py-1 flex items-center gap-1 cursor-pointer transition-all ${
                            order.paymentStatus === "PAID" ? "bg-success/20 text-success" : "bg-error/15 text-error"
                          }`}
                        >
                          {order.paymentStatus} <ChevronDown className="w-2.5 h-2.5" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-1.5 shadow-xl bg-base-300 border border-base-300 rounded-xl w-28 text-[10px] z-50 mt-1 gap-1"
                        >
                          {["PENDING", "PAID"].map((status) => (
                            <li key={status}>
                              <button
                                disabled={isPending}
                                onClick={() => handleOrderPaymentChange(order.id, status)}
                                className={`px-2 py-1.5 rounded-lg text-left w-full ${
                                  order.paymentStatus === status ? "bg-primary text-primary-content font-bold" : "hover:bg-base-200"
                                }`}
                              >
                                {status}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-2 text-xs font-extrabold text-secondary">
                      মোট: ৳ {order.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-base-content/40 bg-base-200 border border-base-300/20 rounded-2xl flex flex-col items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-base-content/20" />
              কোন সার্ভিস বুকিং পাওয়া যায়নি
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-base-200 border border-base-300/30 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-base-300/20 pb-2 relative z-10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-base-content">
                      বুকিং #{booking.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-base-content/40 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(booking.date)} • <Clock className="w-3 h-3" /> {booking.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Booking Status Selector */}
                    <div className="dropdown dropdown-end relative z-20">
                      <div
                        tabIndex={0}
                        role="button"
                        className={`badge badge-sm font-bold text-[9px] rounded px-2 py-1 flex items-center gap-1 cursor-pointer transition-all ${
                          booking.status === "CONFIRMED"
                            ? "bg-success text-success-content"
                            : booking.status === "CANCELLED"
                            ? "bg-error text-white"
                            : "bg-warning/25 text-warning"
                        }`}
                      >
                        {booking.status} <ChevronDown className="w-2.5 h-2.5" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-1.5 shadow-xl bg-base-300 border border-base-300 rounded-xl w-32 text-[10px] z-50 mt-1 gap-1"
                      >
                        {["PENDING", "CONFIRMED", "CANCELLED"].map((status) => (
                          <li key={status}>
                            <button
                              disabled={isPending}
                              onClick={() => handleBookingStatusChange(booking.id, status)}
                              className={`px-2 py-1.5 rounded-lg text-left w-full ${
                                booking.status === status ? "bg-primary text-primary-content font-bold" : "hover:bg-base-200"
                              }`}
                            >
                              {status}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-base-content font-bold">{booking.service.name}</span>
                    <span className="text-[10px] text-base-content/50">সময়কাল: {booking.service.duration} মিনিট</span>
                  </div>
                  <span className="text-secondary font-bold text-xs">
                    ৳ {booking.service.price.toLocaleString()}
                  </span>
                </div>

                {/* Customer Details & Payment Status */}
                <div className="grid grid-cols-2 gap-3 border-t border-base-300/20 pt-3 text-[10px]">
                  <div className="flex flex-col gap-1 text-base-content/60">
                    <span className="font-bold text-base-content/40">গ্রাহকের বিবরণ</span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 flex-shrink-0" /> {booking.user.name || "Guest User"}
                    </span>
                    {booking.user.mobile && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0" /> {booking.user.mobile}
                      </span>
                    )}
                    <span className="truncate w-36">{booking.user.email}</span>
                  </div>

                  <div className="flex flex-col gap-1 text-right items-end">
                    <span className="font-bold text-base-content/40 text-left w-full text-right">পেমেন্ট বিবরণ</span>
                    <span className="text-base-content font-semibold">
                      পদ্ধতি: {booking.paymentMethod === "PAY_ON_SERVICE" ? "সার্ভিস শেষে ক্যাশ" : booking.paymentMethod}
                    </span>

                    {/* Payment Status Dropdown */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-base-content/40 font-medium">পেমেন্ট অবস্থা:</span>
                      <div className="dropdown dropdown-end relative z-20">
                        <div
                          tabIndex={0}
                          role="button"
                          className={`badge badge-sm font-bold text-[9px] rounded px-2 py-1 flex items-center gap-1 cursor-pointer transition-all ${
                            booking.paymentStatus === "PAID" ? "bg-success/20 text-success" : "bg-error/15 text-error"
                          }`}
                        >
                          {booking.paymentStatus} <ChevronDown className="w-2.5 h-2.5" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-1.5 shadow-xl bg-base-300 border border-base-300 rounded-xl w-28 text-[10px] z-50 mt-1 gap-1"
                        >
                          {["PENDING", "PAID"].map((status) => (
                            <li key={status}>
                              <button
                                disabled={isPending}
                                onClick={() => handleBookingPaymentChange(booking.id, status)}
                                className={`px-2 py-1.5 rounded-lg text-left w-full ${
                                  booking.paymentStatus === status ? "bg-primary text-primary-content font-bold" : "hover:bg-base-200"
                                }`}
                              >
                                {status}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
