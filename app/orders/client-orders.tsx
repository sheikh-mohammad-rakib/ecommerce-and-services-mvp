"use client";

import { useState } from "react";
import Image from "next/image";
import { formatBengaliPrice } from "@/app/ui/client-home-components";
import { ClipboardList } from "lucide-react";

// Helper to convert numbers to Bengali digits
function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
}

// Helper to convert dates to Bengali format: e.g. "২৯ মে ২০২৬"
export function formatBengaliDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate();
  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${toBengaliNumber(day)} ${month} ${toBengaliNumber(year)}`;
}

type OrderItem = {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    image: string;
  };
};

type Order = {
  id: string;
  totalAmount: number;
  status: string; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  createdAt: Date | string;
  paymentMethod: string;
  items: OrderItem[];
};

type Booking = {
  id: string;
  date: Date | string;
  timeSlot: string;
  status: string; // PENDING, CONFIRMED, CANCELLED
  service: {
    name: string;
    price: number;
    image: string;
  };
};

export default function ClientOrders({
  initialOrders,
  initialBookings,
}: {
  initialOrders: Order[];
  initialBookings: Booking[];
}) {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "delivered">("all");
  const [selectedDetails, setSelectedDetails] = useState<(Order & { type: "order" }) | (Booking & { type: "booking" }) | null>(null);

  // Filter logic
  const filteredOrders = initialOrders.filter((order) => {
    if (activeTab === "pending") return order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "SHIPPED";
    if (activeTab === "delivered") return order.status === "DELIVERED";
    return true; // "all"
  });

  const filteredBookings = initialBookings.filter((book) => {
    if (activeTab === "pending") return book.status === "PENDING";
    if (activeTab === "delivered") return book.status === "CONFIRMED"; // confirmed services act as completed/delivered for customers
    return true; // "all"
  });

  const isEmpty = filteredOrders.length === 0 && filteredBookings.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Status Filter Tabs */}
      <div className="flex bg-base-200 border border-base-300/50 p-1.5 rounded-full items-center mb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === "all"
              ? "bg-primary text-primary-content shadow"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          সব ({initialOrders.length + initialBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === "pending"
              ? "bg-primary text-primary-content shadow"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          পেন্ডিং ({
            initialOrders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length +
            initialBookings.filter((b) => b.status === "PENDING").length
          })
        </button>
        <button
          onClick={() => setActiveTab("delivered")}
          className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-full transition-all ${
            activeTab === "delivered"
              ? "bg-primary text-primary-content shadow"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          ডেলিভার্ড ({
            initialOrders.filter((o) => o.status === "DELIVERED").length +
            initialBookings.filter((b) => b.status === "CONFIRMED").length
          })
        </button>
      </div>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-12 text-base-content/40 gap-2">
          <ClipboardList className="w-12 h-12 text-base-content/30" />
          <span className="text-sm">কোন অর্ডার খুঁজে পাওয়া যায়নি।</span>
        </div>
      )}

      {/* Render Product Orders */}
      {filteredOrders.map((order) => {
        const firstItem = order.items[0];
        const isPending = order.status === "PENDING";
        const isDelivered = order.status === "DELIVERED";

        return (
          <div
            key={order.id}
            className="w-full bg-base-200 border border-base-300/30 rounded-2xl p-4 flex flex-col gap-4 shadow-md"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-base-content">#{order.id}</span>
              <span
                className={`badge badge-sm font-bold text-[10px] rounded px-2 py-1 ${
                  isDelivered
                    ? "badge-success text-success-content border-none"
                    : isPending
                    ? "bg-warning/20 text-warning border border-base-300/30"
                    : "badge-info text-info-content border-none"
                }`}
              >
                {order.status === "PENDING"
                  ? "পেন্ডিং"
                  : order.status === "CONFIRMED"
                  ? "কনফার্মড"
                  : order.status === "SHIPPED"
                  ? "অন দ্য ওয়ে"
                  : order.status === "DELIVERED"
                  ? "ডেলিভার্ড"
                  : "বাতিল"}
              </span>
            </div>

            {/* Content row */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-base-300 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                <Image
                  src={firstItem?.product?.image || "https://picsum.photos/id/2/400/400"}
                  alt={firstItem?.product?.name || "Order Item"}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-base-content/50">
                  {formatBengaliDate(order.createdAt)}
                </span>
                <h4 className="text-[12px] font-bold text-base-content line-clamp-1 leading-snug">
                  {firstItem
                    ? `${toBengaliNumber(firstItem.quantity)} x ${firstItem.product.name}`
                    : "Product Order"}
                  {order.items.length > 1 && ` (+ আরও ${toBengaliNumber(order.items.length - 1)}টি)`}
                </h4>
                <span className="text-[14px] font-extrabold text-secondary mt-1">
                  ৳ {formatBengaliPrice(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => setSelectedDetails({ type: "order", ...order })}
              className="btn btn-sm bg-secondary hover:bg-secondary/80 text-secondary-content border-none w-full rounded-xl text-xs py-1"
            >
              বিস্তারিত দেখুন
            </button>
          </div>
        );
      })}

      {/* Render Service Bookings */}
      {filteredBookings.map((book) => {
        const isPending = book.status === "PENDING";
        const isConfirmed = book.status === "CONFIRMED";

        return (
          <div
            key={book.id}
            className="w-full bg-base-200 border border-base-300/30 rounded-2xl p-4 flex flex-col gap-4 shadow-md"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-base-content">#বুকিং-{toBengaliNumber(book.id.substring(0, 4))}</span>
              <span
                className={`badge badge-sm font-bold text-[10px] rounded px-2 py-1 ${
                  isConfirmed
                    ? "badge-success text-success-content border-none"
                    : isPending
                    ? "bg-warning/20 text-warning border border-base-300/30"
                    : "badge-error text-error-content border-none"
                }`}
              >
                {book.status === "PENDING"
                  ? "পেন্ডিং"
                  : book.status === "CONFIRMED"
                  ? "কনফার্মড"
                  : "বাতিল"}
              </span>
            </div>

            {/* Content row */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-base-300 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                <Image
                  src={book.service.image}
                  alt={book.service.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-base-content/50">
                  {formatBengaliDate(book.date)}
                </span>
                <h4 className="text-[12px] font-bold text-base-content line-clamp-1 leading-snug">
                  {book.service.name}
                </h4>
                <span className="text-[11px] text-base-content/50">
                  সময়: {toBengaliNumber(book.timeSlot)}
                </span>
                <span className="text-[14px] font-extrabold text-secondary mt-1">
                  ৳ {formatBengaliPrice(book.service.price)}
                </span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => setSelectedDetails({ type: "booking", ...book })}
              className="btn btn-sm bg-primary hover:bg-primary/80 text-primary-content border-none w-full rounded-xl text-xs py-1"
            >
              বিস্তারিত দেখুন
            </button>
          </div>
        );
      })}

      {/* Details Modal Drawer */}
      {selectedDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4">
          <div className="max-w-md w-full bg-base-200 rounded-t-3xl p-6 border-t border-base-300/40 flex flex-col gap-4 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-base-300/30 pb-3">
              <h3 className="text-md font-bold text-base-content">বিস্তারিত তথ্য</h3>
              <button
                onClick={() => setSelectedDetails(null)}
                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
              >
                ✕
              </button>
            </div>

            {selectedDetails.type === "order" ? (
              <div className="flex flex-col gap-4 text-xs text-base-content/80">
                <div className="flex justify-between">
                  <span>অর্ডার আইডি:</span>
                  <span className="font-bold text-base-content">#{selectedDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>তারিখ:</span>
                  <span>{formatBengaliDate(selectedDetails.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>পেমেন্ট পদ্ধতি:</span>
                  <span>
                    {selectedDetails.paymentMethod === "CASH_ON_DELIVERY"
                      ? "ক্যাশ অন ডেলিভারি"
                      : selectedDetails.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>অবস্থা:</span>
                  <span className="text-secondary font-bold">
                    {selectedDetails.status === "PENDING"
                      ? "পেন্ডিং"
                      : selectedDetails.status === "DELIVERED"
                      ? "ডেলিভার্ড"
                      : selectedDetails.status}
                  </span>
                </div>

                <div className="border-t border-base-300/30 pt-3 flex flex-col gap-2">
                  <span className="font-bold text-base-content/60">আইটেম তালিকা:</span>
                  {selectedDetails.items.map((item: OrderItem, i: number) => (
                    <div key={i} className="flex justify-between items-center text-base-content/80">
                      <span>
                        {item.product.name} (x{toBengaliNumber(item.quantity)})
                      </span>
                      <span>৳ {formatBengaliPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-base-300/30 pt-3 flex justify-between font-bold text-sm text-base-content">
                  <span>মোট পরিশোধযোগ্য:</span>
                  <span className="text-secondary">
                    ৳ {formatBengaliPrice(selectedDetails.totalAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs text-base-content/80">
                <div className="flex justify-between">
                  <span>সার্ভিস নাম:</span>
                  <span className="font-bold text-base-content">
                    {selectedDetails.service.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>তারিখ:</span>
                  <span>{formatBengaliDate(selectedDetails.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>সময় সূচি:</span>
                  <span className="text-secondary">{toBengaliNumber(selectedDetails.timeSlot)}</span>
                </div>
                <div className="flex justify-between">
                  <span>পেমেন্ট পদ্ধতি:</span>
                  <span>পে অন সার্ভিস</span>
                </div>
                <div className="flex justify-between">
                  <span>অবস্থা:</span>
                  <span className="text-secondary font-bold">
                    {selectedDetails.status === "PENDING"
                      ? "পেন্ডিং"
                      : selectedDetails.status === "CONFIRMED"
                      ? "কনফার্মড"
                      : selectedDetails.status}
                  </span>
                </div>
                <div className="border-t border-base-300/30 pt-3 flex justify-between font-bold text-sm text-base-content">
                  <span>সার্ভিস ফি:</span>
                  <span className="text-secondary">
                    ৳ {formatBengaliPrice(selectedDetails.service.price)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
