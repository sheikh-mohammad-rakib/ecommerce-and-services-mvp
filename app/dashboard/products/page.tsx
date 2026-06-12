import prisma from "@/lib/prisma";
import ClientProducts from "./client-products";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

async function getAdminProducts() {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function ProductsContainer() {
  const products = await getAdminProducts();
  return <ClientProducts initialProducts={products} />;
}

export default async function DashboardProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-base-100 flex-1 text-center">
          <span className="loading loading-spinner text-primary"></span>
          <h2 className="text-sm font-bold text-base-content/60">পণ্য লোড হচ্ছে...</h2>
        </div>
      }
    >
      <ProductsContainer />
    </Suspense>
  );
}
