"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { formatBengaliPrice } from "@/app/ui/client-home-components";
import { placeOrder } from "@/app/actions/checkout";
import { MapPin, CreditCard, ShieldCheck, ArrowLeft, Check, Smartphone } from "lucide-react";

// Helper to convert numbers to Bengali digits
function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, cartTotal, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();

  // Multi-step state: 1 = Address Form, 2 = Payment Method, 3 = Confirmation
  const [step, setStep] = useState<1 | 2>(1);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Address Inputs
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("ঢাকা");
  const [mobile, setMobile] = useState("");

  // Step 2: Payment Inputs
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "BKASH" | "NAGAD">("CASH_ON_DELIVERY");

  // Prefill user profile details from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      if ((session.user as any).mobile) setMobile((session.user as any).mobile);
      if ((session.user as any).address) setAddress((session.user as any).address);
      if ((session.user as any).city) setCity((session.user as any).city);
    }
  }, [session]);

  const deliveryCharge = 60; // ৳ 60 delivery charge as per screenshots
  const totalPayable = cartTotal + deliveryCharge;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !city || !mobile) {
      setErrorMsg("অনুগ্রহ করে সব তথ্য পূরণ করুন।");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleConfirmOrder = () => {
    setErrorMsg("");
    const itemsInput = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    startTransition(async () => {
      const result = await placeOrder({
        items: itemsInput,
        shippingAddress: address,
        city,
        mobile,
        paymentMethod,
      });

      if (result.error) {
        setErrorMsg(result.error);
      } else if (result.success && result.order) {
        clearCart();
        router.push(`/checkout/success?id=${result.order.id}`);
      }
    });
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
        <h2 className="text-md font-bold text-white">চেকআউট করার মত কোন পণ্য নেই</h2>
        <Link href="/products" className="btn btn-primary rounded-full px-6 text-xs">
          প্রোডাক্ট ব্রাউজ করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-[#050811] flex-1 pb-16">
      {/* Back to Cart link */}
      <Link
        href="/cart"
        className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> কার্টে ফিরুন
      </Link>

      <h2 className="text-xl font-bold text-white tracking-wide border-b border-zinc-900 pb-2">
        চেকআউট
      </h2>

      {/* Progress Steps Indicators */}
      <div className="flex items-center justify-center gap-2 w-full select-none">
        {/* Step 1 indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? "bg-[#06b6d4] text-zinc-950" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            ১
          </span>
          <span className={`text-xs font-bold ${step >= 1 ? "text-white" : "text-zinc-500"}`}>
            ঠিকানা
          </span>
        </div>
        <div className="w-10 h-[1px] bg-zinc-800" />

        {/* Step 2 indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? "bg-[#06b6d4] text-zinc-950" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            ২
          </span>
          <span className={`text-xs font-bold ${step >= 2 ? "text-white" : "text-zinc-500"}`}>
            পেমেন্ট
          </span>
        </div>
        <div className="w-10 h-[1px] bg-zinc-800" />

        {/* Step 3 indicator */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold">
            ৩
          </span>
          <span className="text-xs font-bold text-zinc-500">কনফার্ম</span>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-xs p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: ADDRESS DETAILS */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="flex flex-col gap-4">
          <div className="card bg-[#0d1222] border border-zinc-800/40 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" /> ডেলিভারি ঠিকানা
            </h3>

            {/* Name input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400">নাম</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full bg-[#0a0d17] border border-zinc-800 rounded-xl py-3 px-4 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Address Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400">
                ঠিকানা (বাসা নং, রোড নং, এলাকা)
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা নং, রোড নং, এলাকা লিখুন"
                className="w-full bg-[#0a0d17] border border-zinc-800 rounded-xl py-3 px-4 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* City & Mobile Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400">শহর</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="শহর লিখুন"
                  className="w-full bg-[#0a0d17] border border-zinc-800 rounded-xl py-3 px-4 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400">মোবাইল নম্বর</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="০১৭XXXXXXXX"
                  className="w-full bg-[#0a0d17] border border-zinc-800 rounded-xl py-3 px-4 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Submit Step 1 Button */}
            <button
              type="submit"
              className="btn bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-secondary-content border-none w-full rounded-xl flex items-center justify-center text-xs py-3 mt-2 font-bold shadow-md"
            >
              পরবর্তী ধাপে যান
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: PAYMENT METHOD & SUMMARY */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          {/* Back button to Step 1 */}
          <button
            onClick={() => setStep(1)}
            className="btn btn-sm btn-ghost text-xs text-zinc-400 hover:text-white w-fit rounded-lg flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> ঠিকানা পরিবর্তন করুন
          </button>

          {/* Payment Method Panel */}
          <div className="card bg-[#0d1222] border border-zinc-800/40 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-secondary" /> পেমেন্ট পদ্ধতি
            </h3>

            {/* Methods list */}
            <div className="flex flex-col gap-3">
              {/* Cash on Delivery */}
              <button
                onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === "CASH_ON_DELIVERY"
                    ? "bg-[#0c1b1f] border-secondary"
                    : "bg-[#0b0f19] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0e1424] flex items-center justify-center text-secondary border border-zinc-800">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">ক্যাশ অন ডেলিভারি</span>
                    <span className="text-[10px] text-zinc-400">ডেলিভারির সময় পেমেন্ট</span>
                  </div>
                </div>
                {paymentMethod === "CASH_ON_DELIVERY" && (
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>

              {/* bKash */}
              <button
                onClick={() => setPaymentMethod("BKASH")}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === "BKASH"
                    ? "bg-[#0c1b1f] border-secondary"
                    : "bg-[#0b0f19] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0e1424] flex items-center justify-center text-zinc-500 border border-zinc-800">
                    <span className="font-extrabold text-sm text-pink-500">ব</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">বিকাশ</span>
                    <span className="text-[10px] text-zinc-400">বিকাশ মোবাইল ব্যাংকিং</span>
                  </div>
                </div>
                {paymentMethod === "BKASH" && (
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>

              {/* Nagad */}
              <button
                onClick={() => setPaymentMethod("NAGAD")}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === "NAGAD"
                    ? "bg-[#0c1b1f] border-secondary"
                    : "bg-[#0b0f19] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0e1424] flex items-center justify-center text-zinc-500 border border-zinc-800">
                    <span className="font-extrabold text-sm text-orange-500">ন</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">নগদ</span>
                    <span className="text-[10px] text-zinc-400">নগদ পেমেন্ট সিস্টেম</span>
                  </div>
                </div>
                {paymentMethod === "NAGAD" && (
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Order Summary Confirmation Card */}
          <div className="card bg-[#0d1222] border border-zinc-800/40 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">
              অর্ডার সামারি
            </h3>

            {/* Cart line items with qty and item total */}
            <div className="flex flex-col gap-3 border-b border-zinc-900 pb-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4 text-xs text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Image src={item.image} alt={item.name} width={32} height={32} className="w-8 h-8 object-cover rounded-lg bg-zinc-900" />
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-100 line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-zinc-500">
                        {toBengaliNumber(item.quantity)}x ৳{formatBengaliPrice(item.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-white mt-1">
                    ৳ {formatBengaliPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Maths breakdown */}
            <div className="flex flex-col gap-2.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>সাবটোটাল</span>
                <span>৳ {formatBengaliPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি</span>
                <span>৳ {formatBengaliPrice(deliveryCharge)}</span>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold text-sm text-white">
                <span>মোট</span>
                <span className="text-secondary text-base">
                  ৳ {formatBengaliPrice(totalPayable)}
                </span>
              </div>
            </div>

            {/* Confirm CTA with Dynamic Total */}
            <button
              onClick={handleConfirmOrder}
              disabled={isPending}
              className="btn bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-secondary-content border-none w-full rounded-2xl flex items-center justify-center text-xs py-3 mt-2 font-bold shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isPending ? "অর্ডার সম্পন্ন হচ্ছে..." : `অর্ডার কনফার্ম করুন — ৳ ${formatBengaliPrice(totalPayable)}`}
            </button>

            {/* Safety Indicator Badge */}
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-500 font-semibold mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>নিরাপদ ও সুরক্ষিত পেমেন্ট</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
