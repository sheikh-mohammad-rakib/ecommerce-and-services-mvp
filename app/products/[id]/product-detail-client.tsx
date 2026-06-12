"use client";

import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import { formatBengaliPrice } from "@/app/ui/client-home-components";
import { ShoppingCart, ShieldCheck, Truck } from "lucide-react";

// Helper to convert numbers to Bengali digits
function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
}

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    alert("পণ্যটি কার্টে যোগ করা হয়েছে।");
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-[#0d1222] border border-zinc-800/40 p-4 rounded-2xl shadow-md">
      {/* Product Image */}
      <div className="w-full aspect-square bg-zinc-900 overflow-hidden rounded-xl flex items-center justify-center p-2 border border-zinc-800/40">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Details info */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-secondary font-bold w-fit bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/15">
            {product.category === "Gas cylinder" ? "গ্যাস সিলিন্ডার" : product.category === "Fridge" ? "ফ্রিজ" : product.category === "Groceries" ? "মুদি পণ্য" : product.category}
          </span>
          <h1 className="text-base font-bold text-white leading-snug">
            {product.name}
          </h1>
        </div>

        {/* Price & Stock */}
        <div className="flex justify-between items-baseline border-y border-zinc-900 py-3">
          <span className="text-xl font-extrabold text-secondary">
            ৳ {formatBengaliPrice(product.price)}
          </span>
          <span className="text-[11px] text-zinc-400">
            স্টক: {product.stock > 0 ? `${toBengaliNumber(product.stock)}টি উপলব্ধ` : "স্টক আউট"}
          </span>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-xs font-bold text-zinc-400">প্রোডাক্ট বিবরণ:</h4>
          <p className="text-xs text-zinc-300 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        {/* Add to Cart CTA */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="btn bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-secondary-content border-none w-full rounded-xl flex items-center justify-center gap-2 text-xs py-3.5 mt-2 font-bold shadow-md disabled:opacity-50"
        >
          <ShoppingCart className="w-4.5 h-4.5" />
          {product.stock > 0 ? "কার্টে যোগ করুন" : "স্টক আউট"}
        </button>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 mt-2 border-t border-zinc-900 pt-3">
          <div className="flex items-center gap-2 justify-center p-2.5 rounded-xl border border-zinc-800 bg-[#0d1222]/30 text-[9px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-bold">নিরাপদ পেমেন্ট</span>
          </div>
          <div className="flex items-center gap-2 justify-center p-2.5 rounded-xl border border-zinc-800 bg-[#0d1222]/30 text-[9px] text-zinc-400">
            <Truck className="w-4 h-4 text-secondary" />
            <span className="font-bold">দ্রুত ডেলিভারি</span>
          </div>
        </div>
      </div>
    </div>
  );
}
