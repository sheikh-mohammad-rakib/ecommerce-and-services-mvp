import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#080c14] border-t border-zinc-900/60 py-6 px-4 flex flex-col items-center gap-4 text-center mt-auto text-xs text-zinc-500">
      <div className="flex items-center gap-4">
        <Link href="/" className="hover:underline hover:text-zinc-400">
          হোম
        </Link>
        <span className="text-zinc-700">|</span>
        <Link href="/products" className="hover:underline hover:text-zinc-400">
          পণ্য সমূহ
        </Link>
        <span className="text-zinc-700">|</span>
        <Link href="/services" className="hover:underline hover:text-zinc-400">
          সার্ভিস সমূহ
        </Link>
      </div>

      <div className="text-[11px] text-zinc-600">
        © ২০২৬ ড্রিম কেয়ার। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
