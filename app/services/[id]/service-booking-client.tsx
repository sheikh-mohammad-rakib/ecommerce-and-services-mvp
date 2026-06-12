"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatBengaliPrice } from "@/app/ui/client-home-components";
import { getBookedSlots, createBooking } from "@/app/actions/bookings";
import { Calendar as CalendarIcon, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

// Predefined booking time slots
const AVAILABLE_TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

// Helper to convert numbers to Bengali digits
function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
}

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  category: string;
};

export default function ServiceBookingClient({ service }: { service: Service }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Get tomorrow's date string YYYY-MM-DD
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTomorrowString());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load booked slots when date changes
  useEffect(() => {
    setErrorMsg("");
    startTransition(async () => {
      const booked = await getBookedSlots(service.id, selectedDate);
      setBookedSlots(booked);
    });
  }, [selectedDate, service.id]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setErrorMsg("অনুগ্রহ করে তারিখ এবং সময় সূচি নির্বাচন করুন।");
      return;
    }

    setErrorMsg("");
    startTransition(async () => {
      const result = await createBooking(service.id, selectedDate, selectedSlot);
      if (result.error) {
        setErrorMsg(result.error);
      } else if (result.success) {
        setSuccessMsg("আপনার বুকিং সফলভাবে গ্রহণ করা হয়েছে! আপনি এটি আপনার অর্ডারে দেখতে পাবেন।");
        setTimeout(() => {
          router.push("/orders");
        }, 2000);
      }
    });
  };

  if (successMsg) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-20 bg-[#0d1222] border border-zinc-800/40 rounded-2xl shadow-md text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold text-white">বুকিং সফল হয়েছে!</h3>
          <p className="text-xs text-zinc-400 leading-normal">{successMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full bg-[#0d1222] border border-zinc-800/40 p-4 rounded-2xl shadow-md">
      {/* Service Details Card Header */}
      <div className="flex gap-4 border-b border-zinc-900 pb-4">
        <div className="w-16 h-16 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-zinc-800/40">
          <Image src={service.image} alt={service.name} width={64} height={64} className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-primary font-bold w-fit bg-primary/10 px-2 py-0.5 rounded-full border border-primary/15">
            {service.category === "Air Conditioner" ? "এসি সার্ভিস" : service.category === "Car service" ? "কার সার্ভিস" : service.category === "Fridge" ? "ফ্রিজ সার্ভিস" : service.category}
          </span>
          <h3 className="text-sm font-bold text-white leading-tight">{service.name}</h3>
          <span className="text-xs text-zinc-400 font-medium">সময়সীমা: {toBengaliNumber(service.duration)} মিনিট</span>
        </div>
      </div>

      <div className="flex justify-between items-baseline py-2">
        <span className="text-sm text-zinc-400 font-bold">সার্ভিস ফি:</span>
        <span className="text-lg font-extrabold text-secondary">৳ {formatBengaliPrice(service.price)}</span>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-xs p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Date & Time Booking Form */}
      <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
        {/* Date Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-secondary" /> তারিখ নির্বাচন করুন
          </label>
          <input
            type="date"
            required
            min={getTomorrowString()}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#0a0d17] border border-zinc-800 rounded-xl py-3 px-4 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-all font-mono"
          />
        </div>

        {/* Time Slot Grid */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-secondary" /> সময় সূচি নির্বাচন করুন
          </label>

          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_TIME_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = selectedSlot === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`btn py-3 text-xs font-bold rounded-xl border transition-all ${
                    isSelected
                      ? "bg-secondary text-secondary-content border-secondary shadow-md"
                      : isBooked
                      ? "bg-zinc-900 border-zinc-950 text-zinc-600 cursor-not-allowed opacity-40 line-through"
                      : "bg-[#0a0d17] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {toBengaliNumber(slot)}
                  {isBooked && " (বুকড)"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Booking Button */}
        <button
          type="submit"
          disabled={isPending || !selectedSlot}
          className="btn bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-secondary-content border-none w-full rounded-xl flex items-center justify-center text-xs py-3.5 mt-4 font-bold shadow-md disabled:opacity-50"
        >
          {isPending ? "অনুরোধ পাঠানো হচ্ছে..." : "বুকিং নিশ্চিত করুন"}
        </button>
      </form>

      {/* Safety indicator footer */}
      <div className="flex items-center gap-2 justify-center p-3 rounded-xl border border-zinc-900 bg-[#0d1222]/30 text-[10px] text-zinc-500 font-bold mt-2 w-full">
        <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
        <span>নিরাপদ ও নির্ভরযোগ্য সেবা</span>
      </div>
    </div>
  );
}
