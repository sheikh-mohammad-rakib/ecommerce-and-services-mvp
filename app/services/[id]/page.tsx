import { getServiceById } from "@/app/actions/bookings";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ServiceBookingClient from "./service-booking-client";
import { Suspense } from "react";

async function ServiceBookingContainer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
        <h2 className="text-md font-bold text-white">সার্ভিসটি খুঁজে পাওয়া যায়নি</h2>
        <Link href="/services" className="btn btn-primary rounded-full px-6 text-xs">
          সার্ভিস তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  return <ServiceBookingClient service={service} />;
}

export default async function ServiceBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-[#050811] flex-1 pb-16">
      {/* Back button */}
      <Link
        href="/services"
        className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> সার্ভিস তালিকায় ফিরুন
      </Link>

      <Suspense fallback={
        <div className="text-center py-20 text-zinc-500 text-sm animate-pulse">
          সার্ভিস বিবরণী লোড হচ্ছে...
        </div>
      }>
        <ServiceBookingContainer params={params} />
      </Suspense>
    </div>
  );
}
