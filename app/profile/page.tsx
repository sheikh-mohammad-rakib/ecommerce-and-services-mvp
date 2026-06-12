import { auth } from "@/auth";
import Link from "next/link";
import ClientProfile from "./client-profile";
import { Suspense } from "react";

async function ProfileContainer() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
        <h2 className="text-lg font-bold text-white">প্রোফাইল দেখতে লগইন করুন</h2>
        <Link href="/login" className="btn btn-primary rounded-full px-6">
          লগইন করুন
        </Link>
      </div>
    );
  }

  return <ClientProfile user={session.user!} />;
}

export default async function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-[#050811] flex-1 pb-16">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
          <h2 className="text-lg font-bold text-white animate-pulse">প্রোফাইল লোড হচ্ছে...</h2>
        </div>
      }>
        <ProfileContainer />
      </Suspense>
    </div>
  );
}
