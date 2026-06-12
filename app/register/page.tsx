"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, FormState } from "@/app/actions/auth";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<FormState>(undefined);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await registerUser(undefined, formData);
      setState(res);
      if (res?.success) {
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    });
  };

  return (
    <div className="flex flex-col flex-1 justify-center items-center px-6 py-12 bg-[#050811] text-zinc-100 min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Branding Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-2xl shadow-[0_0_20px_oklch(81%_0.111_293.571)] select-none">
            <span className="text-primary-content font-extrabold text-2xl">DC</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">নতুন অ্যাকাউন্ট</h2>
          <p className="text-xs text-zinc-400">তথ্য প্রদান করে রেজিস্ট্রেশন সম্পন্ন করুন</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Success Message */}
          {state?.success && state?.message && (
            <div className="alert alert-success text-xs p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              {state.message}
            </div>
          )}

          {/* Error Message */}
          {!state?.success && state?.message && (
            <div className="alert alert-error text-xs p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
              {state.message}
            </div>
          )}

          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-400">আপনার নাম</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="name"
                type="text"
                required
                placeholder="আপনার নাম লিখুন"
                className="w-full bg-[#0d1222] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary transition-all"
              />
            </div>
            {state?.errors?.name && (
              <span className="text-[10px] text-rose-400 font-semibold">{state.errors.name[0]}</span>
            )}
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-400">ইমেইল এড্রেস</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="email"
                type="email"
                required
                placeholder="example@mail.com"
                className="w-full bg-[#0d1222] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary transition-all"
              />
            </div>
            {state?.errors?.email && (
              <span className="text-[10px] text-rose-400 font-semibold">{state.errors.email[0]}</span>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-400">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                className="w-full bg-[#0d1222] border border-zinc-800 rounded-xl py-3 pl-10 pr-10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {state?.errors?.password && (
              <span className="text-[10px] text-rose-400 font-semibold">{state.errors.password[0]}</span>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isPending || state?.success}
            className="btn bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-secondary-content border-none w-full rounded-xl flex items-center justify-center gap-2 text-xs py-3 mt-2 font-bold shadow-md disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {isPending ? "রেজিস্টার হচ্ছে..." : "রেজিস্টার করুন"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-[1px] bg-zinc-900" />
          <span className="text-[10px] font-bold text-zinc-600">অথবা</span>
          <div className="flex-1 h-[1px] bg-zinc-900" />
        </div>

        {/* Google OAuth Mock button */}
        <button
          onClick={() => alert("Google Sign-In is simulated. Credentials registration is fully functional.")}
          className="btn btn-outline border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40 text-xs font-bold text-zinc-300 rounded-xl w-full flex items-center justify-center gap-2.5 py-3"
        >
          <span className="text-rose-500 font-extrabold text-xs">G</span> Google দিয়ে সাইনআপ
        </button>

        {/* Redirect Footer */}
        <span className="text-[11px] text-center text-zinc-500">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="font-bold text-secondary hover:underline">
            লগইন করুন
          </Link>
        </span>
      </div>
    </div>
  );
}
