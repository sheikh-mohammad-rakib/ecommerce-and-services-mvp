import prisma from "@/lib/prisma";
import { getProducts } from "@/app/actions/products";
import ClientHomeComponents from "@/app/ui/client-home-components";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

async function ProductsContainer({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";

  const products = await getProducts(q, category);

  // Strip Date objects for RSC boundary safety
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    category: p.category,
    stock: p.stock,
  }));

  // Fetch unique categories for header/pills
  const allProducts = await prisma.product.findMany({ select: { category: true } });
  const categories = Array.from(new Set(allProducts.map((p: { category: string }) => p.category)));

  return (
    <>
      <div className="flex flex-col gap-1 border-b border-base-300/30 pb-2">
        <h2 className="text-xl font-bold text-base-content tracking-wide">
          {category ? `${category === "Gas cylinder" ? "গ্যাস সিলিন্ডার" : category === "Fridge" ? "ফ্রিজ" : category === "Groceries" ? "মুদি পণ্য" : category}` : "সকল প্রোডাক্ট"}
        </h2>
        {q && <p className="text-xs text-base-content/40">অনুসন্ধান ফলাফল: &quot;{q}&quot;</p>}
      </div>

      {/* Category Pills Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href="/products"
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
            !category
              ? "bg-secondary border-secondary text-secondary-content"
              : "bg-base-200 border-base-300/50 text-base-content/50 hover:text-base-content"
          }`}
        >
          সব পণ্য
        </Link>
        {categories.map((cat, i) => (
          <Link
            key={i}
            href={`/products?category=${encodeURIComponent(cat)}`}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              category === cat
                ? "bg-secondary border-secondary text-secondary-content"
                : "bg-base-200 border-base-300/50 text-base-content/50 hover:text-base-content"
            }`}
          >
            {cat === "Gas cylinder" ? "গ্যাস সিলিন্ডার" : cat === "Fridge" ? "ফ্রিজ" : cat === "Groceries" ? "মুদি পণ্য" : cat}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-base-content/40 text-sm">
          কোন প্রোডাক্ট পাওয়া যায়নি।
        </div>
      ) : (
        /* Reusing home page grid layout */
        <ClientHomeComponents initialProducts={serializedProducts} initialServices={[]} />
      )}
    </>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-base-100 flex-1 pb-16">
      {/* Back button */}
      <Link
        href="/"
        className="flex items-center gap-2 text-xs font-bold text-base-content/60 hover:text-base-content transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> হোমে ফিরুন
      </Link>

      <Suspense fallback={
        <div className="text-center py-20 text-base-content/40 text-sm animate-pulse">
          প্রোডাক্ট লোড হচ্ছে...
        </div>
      }>
        <ProductsContainer searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
