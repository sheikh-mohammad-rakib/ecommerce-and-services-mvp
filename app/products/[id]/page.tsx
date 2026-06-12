import { getProductById } from "@/app/actions/products";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductDetailClient from "./product-detail-client";
import { Suspense } from "react";

async function ProductDetailContainer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
        <h2 className="text-md font-bold text-white">প্রোডাক্টটি খুঁজে পাওয়া যায়নি</h2>
        <Link href="/products" className="btn btn-primary rounded-full px-6 text-xs">
          প্রোডাক্ট তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-[#050811] flex-1 pb-16">
      {/* Back button */}
      <Link
        href="/products"
        className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> প্রোডাক্ট তালিকায় ফিরুন
      </Link>

      <Suspense fallback={
        <div className="text-center py-20 text-zinc-500 text-sm animate-pulse">
          প্রোডাক্ট বিবরণী লোড হচ্ছে...
        </div>
      }>
        <ProductDetailContainer params={params} />
      </Suspense>
    </div>
  );
}
