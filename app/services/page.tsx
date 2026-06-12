import prisma from "@/lib/prisma";
import { getServices } from "@/app/actions/bookings";
import ClientHomeComponents from "@/app/ui/client-home-components";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import type { Service } from "@prisma/client";

async function ServicesContainer({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";

  const services = await getServices(q, category);

  // Strip Date objects for RSC boundary safety
  const serializedServices = services.map((s: Service) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    duration: s.duration,
    image: s.image,
    category: s.category,
  }));

  // Fetch unique categories for header/pills
  const allServices = await prisma.service.findMany({ select: { category: true } });
  const categories = Array.from(new Set(allServices.map((s: { category: string }) => s.category))) as string[];

  return (
    <>
      <div className="flex flex-col gap-1 border-b border-zinc-900 pb-2">
        <h2 className="text-xl font-bold text-white tracking-wide">
          {category ? `${category === "Air Conditioner" ? "এসি সার্ভিস" : category === "Car service" ? "কার সার্ভিস" : category === "Fridge" ? "ফ্রিজ সার্ভিস" : category}` : "সকল সার্ভিস"}
        </h2>
        {q && <p className="text-xs text-zinc-500">অনুসন্ধান ফলাফল: &quot;{q}&quot;</p>}
      </div>

      {/* Category Pills Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href="/services"
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
            !category
              ? "bg-primary border-primary text-primary-content"
              : "bg-[#0d1222] border-zinc-800 text-zinc-400 hover:text-zinc-300"
          }`}
        >
          সব সার্ভিস
        </Link>
        {categories.map((cat, i) => (
          <Link
            key={i}
            href={`/services?category=${encodeURIComponent(cat)}`}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              category === cat
                ? "bg-primary border-primary text-primary-content"
                : "bg-[#0d1222] border-zinc-800 text-zinc-400 hover:text-zinc-300"
            }`}
          >
            {cat === "Air Conditioner" ? "এসি সার্ভিস" : cat === "Car service" ? "কার সার্ভিস" : cat === "Fridge" ? "ফ্রিজ সার্ভিস" : cat}
          </Link>
        ))}
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm">
          কোন সার্ভিস পাওয়া যায়নি।
        </div>
      ) : (
        /* Reusing home page grid layout */
        <ClientHomeComponents initialProducts={[]} initialServices={serializedServices} />
      )}
    </>
  );
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-[#050811] flex-1 pb-16">
      {/* Back button */}
      <Link
        href="/"
        className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> হোমে ফিরুন
      </Link>

      <Suspense fallback={
        <div className="text-center py-20 text-zinc-500 text-sm animate-pulse">
          সার্ভিস লোড হচ্ছে...
        </div>
      }>
        <ServicesContainer searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
