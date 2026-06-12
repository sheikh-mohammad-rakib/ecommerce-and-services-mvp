import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLayoutShell from "@/app/dashboard/admin-layout-shell";
import { Suspense } from "react";

async function AdminLayoutShellContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Route protection: Only allow logged-in ADMIN users
  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-base-100 flex-1 min-h-screen text-center text-base-content">
        <h2 className="text-lg font-bold text-base-content">অননুমোদিত প্রবেশ</h2>
        <p className="text-xs text-base-content/40">
          এই পেজটি শুধুমাত্র সুপার এডমিনদের জন্য নির্ধারিত।
        </p>
        <Link href="/" className="btn btn-primary rounded-full px-6">
          হোমে ফিরে যান
        </Link>
      </div>
    );
  }

  return <AdminLayoutShell user={session.user!}>{children}</AdminLayoutShell>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-base-100 flex-1 min-h-screen text-center text-base-content">
          <span className="loading loading-spinner text-primary"></span>
          <h2 className="text-sm font-bold text-base-content/60">লোড হচ্ছে...</h2>
        </div>
      }
    >
      <AdminLayoutShellContainer>{children}</AdminLayoutShellContainer>
    </Suspense>
  );
}
