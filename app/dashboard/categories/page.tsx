import prisma from "@/lib/prisma";
import Link from "next/link";
import { Car, ShoppingBag, Flame, Wind, Snowflake, HelpCircle, ChevronRight, Package, Wrench } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";

async function getCategoriesData() {
  "use cache";
  cacheTag("products", "services");
  cacheLife("minutes");

  const [products, services] = await Promise.all([
    prisma.product.findMany({ select: { category: true, active: true } }),
    prisma.service.findMany({ select: { category: true, active: true } }),
  ]);

  return { products, services };
}

export default async function DashboardCategoriesPage() {
  const { products, services } = await getCategoriesData();

  // Compute product categories and counts
  const productCatsMap: Record<string, { total: number; active: number }> = {};
  products.forEach((p) => {
    const cat = p.category || "General";
    if (!productCatsMap[cat]) {
      productCatsMap[cat] = { total: 0, active: 0 };
    }
    productCatsMap[cat].total += 1;
    if (p.active) productCatsMap[cat].active += 1;
  });

  // Compute service categories and counts
  const serviceCatsMap: Record<string, { total: number; active: number }> = {};
  services.forEach((s) => {
    const cat = s.category || "General";
    if (!serviceCatsMap[cat]) {
      serviceCatsMap[cat] = { total: 0, active: 0 };
    }
    serviceCatsMap[cat].total += 1;
    if (s.active) serviceCatsMap[cat].active += 1;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "car service":
        return Car;
      case "groceries":
        return ShoppingBag;
      case "gas cylinder":
        return Flame;
      case "air conditioner":
        return Wind;
      case "fridge":
        return Snowflake;
      default:
        return HelpCircle;
    }
  };

  return (
    <div className="px-4 py-6 flex flex-col gap-6 pb-16 bg-base-100 flex-1">
      <div className="flex flex-col gap-1 border-b border-base-300/30 pb-3">
        <h2 className="text-xl font-bold text-base-content tracking-wide">
          ক্যাটাগরি ম্যানেজমেন্ট
        </h2>
        <p className="text-xs text-base-content/50">
          সিস্টেমে বিদ্যমান সকল পণ্য ও সার্ভিস ক্যাটাগরির বিবরণ।
        </p>
      </div>

      {/* Product Categories */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-secondary">
          <Package className="w-5 h-5" />
          <h3 className="text-sm font-bold tracking-wide uppercase">
            পণ্য ক্যাটাগরি সমূহ
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(productCatsMap).length === 0 ? (
            <div className="col-span-full text-center py-6 text-xs text-base-content/40 bg-base-200 rounded-xl">
              কোন পণ্য ক্যাটাগরি পাওয়া যায়নি
            </div>
          ) : (
            Object.entries(productCatsMap).map(([cat, stats], i) => {
              const Icon = getCategoryIcon(cat);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-base-200 border border-base-300/30 rounded-xl shadow-sm hover:border-secondary/35 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center text-secondary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-base-content">
                        {cat === "Gas cylinder" ? "গ্যাস সিলিন্ডার" : cat === "Fridge" ? "ফ্রিজ" : cat === "Groceries" ? "মুদি পণ্য" : cat}
                      </span>
                      <span className="text-[10px] text-base-content/50 font-medium">
                        মোট পণ্য: {stats.total} (সক্রিয়: {stats.active})
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/products?category=${encodeURIComponent(cat)}`}
                    className="btn btn-square btn-sm btn-ghost text-base-content/60 hover:text-secondary hover:bg-secondary/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Service Categories */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex items-center gap-2 text-primary">
          <Wrench className="w-5 h-5" />
          <h3 className="text-sm font-bold tracking-wide uppercase">
            সার্ভিস ক্যাটাগরি সমূহ
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(serviceCatsMap).length === 0 ? (
            <div className="col-span-full text-center py-6 text-xs text-base-content/40 bg-base-200 rounded-xl">
              কোন সার্ভিস ক্যাটাগরি পাওয়া যায়নি
            </div>
          ) : (
            Object.entries(serviceCatsMap).map(([cat, stats], i) => {
              const Icon = getCategoryIcon(cat);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-base-200 border border-base-300/30 rounded-xl shadow-sm hover:border-primary/35 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-base-content">
                        {cat === "Air Conditioner" ? "এসি সার্ভিস" : cat === "Car service" ? "কার সার্ভিস" : cat === "Fridge" ? "ফ্রিজ সার্ভিস" : cat}
                      </span>
                      <span className="text-[10px] text-base-content/50 font-medium">
                        মোট সার্ভিস: {stats.total} (সক্রিয়: {stats.active})
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/services?category=${encodeURIComponent(cat)}`}
                    className="btn btn-square btn-sm btn-ghost text-base-content/60 hover:text-primary hover:bg-primary/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
