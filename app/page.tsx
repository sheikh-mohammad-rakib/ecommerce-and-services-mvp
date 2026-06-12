import Link from "next/link";
import prisma from "@/lib/prisma";
import { Car, ShoppingBag, Flame, Wind, Snowflake, ShoppingCart, ArrowRight } from "lucide-react";
import ClientHomeComponents from "@/app/ui/client-home-components";
import { cacheLife, cacheTag } from "next/cache";

export default async function Home() {
  "use cache";
  cacheTag("products", "services");
  cacheLife("minutes");

  // Fetch products and services from database
  const products = await prisma.product.findMany({
    where: { active: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const services = await prisma.service.findMany({
    where: { active: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Strip Date objects for RSC boundary safety
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    category: p.category,
    stock: p.stock,
  }));

  const serializedServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    duration: s.duration,
    image: s.image,
    category: s.category,
  }));

  // Map category icons helper
  const categoriesList = [
    { name: "Car service", icon: Car, path: "/services?category=Car%20service" },
    { name: "Groceries", icon: ShoppingBag, path: "/products?category=Groceries" },
    { name: "Gas cylinder", icon: Flame, path: "/products?category=Gas%20cylinder" },
    { name: "Air Conditioner", icon: Wind, path: "/services?category=Air%20Conditioner" },
    { name: "Fridge", icon: Snowflake, path: "/products?category=Fridge" },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-base-100 flex-1 pb-16">
      {/* 1. Hero Promo Banner Slider */}
      <div className="relative w-full rounded-2xl bg-base-200 border border-base-300/30 p-6 overflow-hidden flex flex-col justify-center min-h-[180px]">
        {/* Background AC illustration/glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 flex items-center justify-center">
          <Wind className="w-24 h-24 text-primary animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col gap-2 max-w-[75%]">
          <h2 className="text-xl font-bold text-white leading-tight">
            এসি রিপেয়ার ও সার্ভিসিং
          </h2>
          <p className="text-xs text-base-content/60">
            অভিজ্ঞ টেকনিশিয়ান দ্বারা প্রফেশনাল এসি সার্ভিসিং
          </p>
          <Link
            href="/services"
            className="btn btn-sm btn-primary w-fit mt-2 rounded-full shadow-[0_0_10px_var(--color-primary)] flex items-center gap-1"
          >
            এখনই দেখুন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Carousel indicators dots */}
        <div className="flex items-center gap-1.5 justify-center mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
          <span className="w-4 h-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
        </div>
      </div>

      {/* 2. Categories Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-md font-bold text-base-content tracking-wide">ক্যাটাগরি</h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none justify-between">
          {categoriesList.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={i}
                href={cat.path}
                className="flex flex-col items-center gap-1.5 min-w-[70px] group"
              >
                <div className="w-14 h-14 rounded-2xl bg-base-200 border border-base-300/60 flex items-center justify-center text-secondary group-hover:text-primary group-hover:border-primary/40 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] text-base-content/50 font-medium text-center truncate w-full">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Special Offer Banner */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-[#005c8a] to-[#0d7d8e] p-5 relative overflow-hidden flex flex-col gap-2 shadow-[0_6px_20px_rgba(13,125,142,0.15)]">
        {/* Glow circles */}
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-[#ffffff]/10 blur-xl"></div>
        <div className="absolute right-12 -bottom-6 w-20 h-20 rounded-full bg-[#ffffff]/10 blur-xl"></div>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="badge badge-sm bg-[#e2733f] text-white border-none font-semibold px-2 py-2 flex items-center gap-1 w-fit rounded-full">
            🔥 বিশেষ অফার
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">
            সব সার্ভিসে ২০% ছাড়!
          </h3>
          <p className="text-xs text-cyan-100 font-medium">
            Promo Code : Mahhmud
          </p>
          <Link
            href="/services"
            className="btn btn-sm bg-white hover:bg-zinc-100 text-[#0d7d8e] border-none font-bold rounded-full w-fit px-4 shadow-md mt-1"
          >
            অর্ডার করুন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Interactive Products / Services Toggle and Lists */}
      <ClientHomeComponents initialProducts={serializedProducts} initialServices={serializedServices} />
    </div>
  );
}
