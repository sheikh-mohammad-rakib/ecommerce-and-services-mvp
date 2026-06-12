import { auth } from "@/auth";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ClientNotifications from "./client-notifications";
import type { Notification } from "@prisma/client";
import { Suspense } from "react";

async function NotificationsContainer() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
        <h2 className="text-lg font-bold text-white">নোটিফিকেশন দেখতে লগইন করুন</h2>
        <Link href="/login" className="btn btn-primary rounded-full px-6">
          লগইন করুন
        </Link>
      </div>
    );
  }

  const userId = session.user.id as string;

  // Fetch all user notifications
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates to prevent RSC boundary issues
  const serializedNotifications = notifications.map((note: Notification) => ({
    id: note.id,
    title: note.title,
    message: note.message,
    type: note.type,
    isRead: note.isRead,
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
  }));

  return <ClientNotifications initialNotifications={serializedNotifications} />;
}

export default async function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-4 bg-[#050811] flex-1 pb-16">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-[#050811] flex-1 text-center">
          <h2 className="text-lg font-bold text-white animate-pulse">নোটিফিকেশন লোড হচ্ছে...</h2>
        </div>
      }>
        <NotificationsContainer />
      </Suspense>
    </div>
  );
}
