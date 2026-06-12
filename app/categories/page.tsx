import Link from "next/link";
import prisma from "@/lib/prisma";
import { Car, ShoppingBag, Flame, Wind, Snowflake, HelpCircle } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";

export default async function CategoriesPage() {
  "use cache";
  cacheTag("products", "services");
  cacheLife("minutes");

  // Get unique categories from products and services
  const products = await prisma.product.findMany({ select: { category: true } });
  const services = await prisma.service.findMany({ select: { category: true } });

  const productCategories = Array.from(new Set(products.map((p) => p.category)));
  const serviceCategories = Array.from(new Set(services.map((s) => s.category)));

  // helper to match icons
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
    <div className="flex flex-col gap-6 px-4 py-4 bg-base-100 flex-1 pb-16">
      <h2 className="text-xl font-bold text-base-content tracking-wide border-b border-base-300/30 pb-2">
        সব ক্যাটাগরি
      </h2>

      {/* Product Categories Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-base-content/50 tracking-widest uppercase">
          পণ্য ক্যাটাগরি
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {productCategories.map((cat, i) => {
            const Icon = getCategoryIcon(cat);
            return (
              <Link
                key={i}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-3 p-4 bg-base-200 border border-base-300/30 rounded-xl hover:border-primary/40 transition-all shadow-md group"
              >
                <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-base-content group-hover:text-base-content truncate">
                  {cat === "Gas cylinder" ? "গ্যাস সিলিন্ডার" : cat === "Fridge" ? "ফ্রিজ" : cat === "Groceries" ? "মুদি পণ্য" : cat}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Service Categories Section */}
      <div className="flex flex-col gap-3 mt-2">
        <h3 className="text-xs font-semibold text-base-content/50 tracking-widest uppercase">
          সার্ভিস ক্যাটাগরি
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {serviceCategories.map((cat, i) => {
            const Icon = getCategoryIcon(cat);
            return (
              <Link
                key={i}
                href={`/services?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-3 p-4 bg-base-200 border border-base-300/30 rounded-xl hover:border-primary/40 transition-all shadow-md group"
              >
                <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center text-primary group-hover:text-secondary transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-base-content group-hover:text-base-content truncate">
                  {cat === "Air Conditioner" ? "এসি সার্ভিস" : cat === "Car service" ? "কার সার্ভিস" : cat === "Fridge" ? "ফ্রিজ সার্ভিস" : cat}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
