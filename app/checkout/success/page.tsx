"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "SUCCESS";

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-20 bg-[#050811] text-zinc-100 flex-1 text-center">
      {/* Big success checkmark */}
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white tracking-tight">
          অর্ডার সফল হয়েছে!
        </h2>
        <p className="text-xs text-zinc-400">
          আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই একজন প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
        </p>
      </div>

      {/* Order reference Card */}
      <div className="w-full max-w-xs bg-[#0d1222] border border-zinc-800/40 p-4 rounded-xl flex flex-col gap-2 shadow-md">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          অর্ডার রেফারেন্স নম্বর
        </span>
        <span className="text-sm font-extrabold text-secondary select-all">
          #{orderId}
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <Link
          href="/orders"
          className="btn bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-secondary-content border-none w-full rounded-xl flex items-center justify-center gap-1.5 text-xs py-3 font-bold shadow-md"
        >
          <ShoppingBag className="w-4.5 h-4.5" /> আমার অর্ডার দেখুন
        </Link>
        <Link
          href="/"
          className="btn btn-outline border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40 text-xs font-bold text-zinc-300 rounded-xl w-full flex items-center justify-center gap-1.5 py-3"
        >
          হোমে ফিরে যান <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-20 bg-[#050811] text-zinc-100 flex-1 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800/10 border border-zinc-800/20 flex items-center justify-center text-zinc-500 animate-pulse">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight animate-pulse">অর্ডার লোড হচ্ছে...</h2>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
