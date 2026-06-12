"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Calendar } from "lucide-react";

// Helper to convert numbers to Bengali digits and add commas
export function formatBengaliPrice(price: number): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const formatted = price.toLocaleString("en-US");
  return formatted.replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
}

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  image: string;
  category: string;
};

export default function ClientHomeComponents({
  initialProducts,
  initialServices,
}: {
  initialProducts: Product[];
  initialServices: Service[];
}) {
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");
  const { addToCart } = useCart();

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Selector Pills */}
      <div className="w-full bg-base-200 border border-base-300/50 p-1.5 rounded-full flex items-center">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === "products"
              ? "bg-primary text-primary-content shadow"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          পণ্য সমূহ
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === "services"
              ? "bg-primary text-primary-content shadow"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          সার্ভিস সমূহ
        </button>
      </div>

      {/* Conditional Content based on active tab */}
      {activeTab === "products" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-base-content tracking-wide">জনপ্রিয় পণ্য</h3>
            <Link href="/products" className="text-xs font-semibold text-secondary hover:underline">
              সব দেখুন
            </Link>
          </div>

          {/* Grid Layout of products matching Image 2 */}
          <div className="grid grid-cols-2 gap-4">
            {initialProducts.map((prod, idx) => (
              <div
                key={prod.id}
                className="card bg-base-200 border border-base-300/30 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
              >
                {/* Product Image and Badge */}
                <div className="relative aspect-square bg-base-300 flex items-center justify-center p-2">
                  <span className="absolute top-2 left-2 badge badge-sm bg-secondary text-secondary-content border-none font-bold text-[10px] rounded px-1.5 py-1 z-10">
                    নতুন
                  </span>
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover rounded-lg"
                    loading={idx === 0 ? "eager" : "lazy"}
                    priority={idx === 0}
                  />
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[12px] font-bold text-base-content line-clamp-2 min-h-[32px] leading-snug">
                      {prod.name}
                    </h4>
                    <span className="text-[14px] font-extrabold text-secondary">
                      ৳ {formatBengaliPrice(prod.price)}
                    </span>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => addToCart({
                      id: prod.id,
                      name: prod.name,
                      price: prod.price,
                      image: prod.image,
                      category: prod.category,
                    })}
                    className="btn btn-sm btn-secondary font-bold w-full rounded-xl flex items-center justify-center gap-1.5 text-xs py-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> কার্টে যোগ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-base-content tracking-wide">জনপ্রিয় সার্ভিস</h3>
            <Link href="/services" className="text-xs font-semibold text-secondary hover:underline">
              সব দেখুন
            </Link>
          </div>

          {/* Grid Layout of services */}
          <div className="grid grid-cols-2 gap-4">
            {initialServices.map((service, idx) => (
              <div
                key={service.id}
                className="card bg-base-200 border border-base-300/30 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
              >
                {/* Service Image and Badge */}
                <div className="relative aspect-square bg-base-300 flex items-center justify-center p-2">
                  <span className="absolute top-2 left-2 badge badge-sm bg-primary text-primary-content border-none font-bold text-[10px] rounded px-1.5 py-1 z-10">
                    সার্ভিস
                  </span>
                  <Image
                    src={service.image}
                    alt={service.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover rounded-lg"
                    loading={idx === 0 ? "eager" : "lazy"}
                    priority={idx === 0}
                  />
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[12px] font-bold text-base-content line-clamp-2 min-h-[32px] leading-snug">
                      {service.name}
                    </h4>
                    <span className="text-[14px] font-extrabold text-secondary">
                      ৳ {formatBengaliPrice(service.price)}
                    </span>
                  </div>

                  {/* Book Now button */}
                  <Link
                    href={`/services/${service.id}`}
                    className="btn btn-sm btn-accent font-bold w-full rounded-xl flex items-center justify-center gap-1.5 text-xs py-1"
                  >
                    <Calendar className="w-3.5 h-3.5" /> বুকিং করুন
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
