"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatBengaliPrice } from "@/app/ui/client-home-components";
import { Minus, Plus, Trash2, ShieldCheck, Truck, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

// Helper to convert numbers to Bengali digits
function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
}

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  const deliveryCharge = cart.length > 0 ? 60 : 0; // ৳ 60 delivery charge as per screenshots
  const totalPayable = cartTotal + deliveryCharge;

  const handleCheckoutRedirect = () => {
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
        <ShoppingCart className="w-16 h-16 text-zinc-800" />
        <h2 className="text-md font-bold text-white">আপনার কার্ট খালি রয়েছে</h2>
        <p className="text-xs text-zinc-500">
          কার্টে পণ্য যোগ করতে আমাদের প্রোডাক্ট তালিকা দেখুন।
        </p>
        <Link href="/products" className="btn btn-primary rounded-full px-6 text-xs mt-2">
          পণ্য তালিকা দেখুন
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-[#050811] flex-1 pb-16">
      <h2 className="text-xl font-bold text-white tracking-wide border-b border-zinc-900 pb-2">
        শপিং কার্ট
      </h2>

      {/* Cart Items List */}
      <div className="flex flex-col gap-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-[#0d1222] border border-zinc-800/40 rounded-2xl shadow-md relative"
          >
            {/* Product Image */}
            <div className="w-16 h-16 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-zinc-800/40">
              <Image
                src={item.image}
                alt={item.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1 flex-1">
              <h4 className="text-[12px] font-bold text-zinc-100 line-clamp-1 leading-snug">
                {item.name}
              </h4>
              <span className="text-[10px] text-secondary font-bold">
                {item.category === "Gas cylinder" ? "গ্যাস সিলিন্ডার" : item.category === "Fridge" ? "ফ্রিজ" : item.category === "Groceries" ? "মুদি পণ্য" : item.category}
              </span>
              <span className="text-[13px] font-extrabold text-white mt-0.5">
                ৳ {formatBengaliPrice(item.price * item.quantity)}
              </span>
              <span className="text-[9px] text-zinc-500">
                একক মূল্য: ৳ {formatBengaliPrice(item.price)}
              </span>
            </div>

            {/* Quantity Controls and Delete Column */}
            <div className="flex flex-col items-end gap-3 justify-between">
              {/* Delete button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Quantity Counter */}
              <div className="flex items-center bg-[#0b0f19] border border-zinc-800 rounded-lg p-0.5 select-none">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs text-white font-bold">
                  {toBengaliNumber(item.quantity)}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-6 h-6 bg-secondary text-secondary-content rounded flex items-center justify-center hover:bg-[#0aa19c] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary Card */}
      <div className="card bg-[#0d1222] border border-zinc-800/40 rounded-2xl p-5 flex flex-col gap-4 shadow-md mt-2">
        {/* Accent Top Bar */}
        <div className="h-1 w-full bg-secondary rounded-full -mt-5 mb-2" />

        <h3 className="text-md font-bold text-white border-b border-zinc-900 pb-2">
          অর্ডার সামারি
        </h3>

        <div className="flex flex-col gap-3 text-xs text-zinc-300">
          <div className="flex justify-between">
            <span>আইটেম সাবটোটাল</span>
            <span>৳ {formatBengaliPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>ডেলিভারি চার্জ</span>
            <span>৳ {formatBengaliPrice(deliveryCharge)}</span>
          </div>

          <div className="border-t border-zinc-800 pt-3 flex justify-between font-extrabold text-sm text-white">
            <span>মোট পরিশোধযোগ্য</span>
            <span className="text-secondary text-base">
              ৳ {formatBengaliPrice(totalPayable)}
            </span>
          </div>
        </div>

        {/* Checkout CTA */}
        <button
          onClick={handleCheckoutRedirect}
          className="btn bg-gradient-to-r from-[#06b6d4] to-[#0d7d8e] hover:from-[#06b6d4]/90 hover:to-[#0d7d8e]/90 text-zinc-950 font-bold border-none w-full rounded-2xl flex items-center justify-center gap-1.5 text-xs py-3 mt-2 shadow-md"
        >
          চেকআউট করুন
        </button>

        <p className="text-[10px] text-zinc-500 text-center leading-normal">
          পরবর্তী ধাপে আপনি আপনার ঠিকানা এবং পেমেন্ট মেথড নির্বাচন করতে পারবেন।
        </p>
      </div>

      {/* Safety indicators footer */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex items-center gap-2 justify-center p-3 rounded-xl border border-zinc-800 bg-[#0d1222]/30 text-[10px] text-zinc-400">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
          <span className="font-bold">নিরাপদ পেমেন্ট</span>
        </div>
        <div className="flex items-center gap-2 justify-center p-3 rounded-xl border border-zinc-800 bg-[#0d1222]/30 text-[10px] text-zinc-400">
          <Truck className="w-4.5 h-4.5 text-secondary" />
          <span className="font-bold">দ্রুত ডেলিভারি</span>
        </div>
      </div>
    </div>
  );
}
