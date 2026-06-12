import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart-context";
import { Suspense } from "react";
import Navbar from "@/app/ui/navbar";
import BottomNav from "@/app/ui/bottom-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dream Care",
  description: "Ecommerce and Services MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dreamcare"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen w-full bg-neutral flex justify-center items-start text-base-content font-sans antialiased">
        <SessionProvider>
          <CartProvider>
            <div className="max-w-md w-full min-h-screen bg-base-100 flex flex-col relative pb-16 shadow-2xl border-x border-base-300/10">
              <Suspense fallback={<div className="h-16 w-full bg-base-200" />}>
                <Navbar />
              </Suspense>
              <main className="flex-1 w-full flex flex-col">
                {children}
              </main>
              <Suspense fallback={<div className="h-12 w-full bg-base-200 border-t border-base-300/30" />}>
                <BottomNav />
              </Suspense>
            </div>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
