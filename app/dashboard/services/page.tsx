import prisma from "@/lib/prisma";
import ClientServices from "./client-services";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

async function getAdminServices() {
  "use cache";
  cacheTag("services");
  cacheLife("minutes");

  return await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function ServicesContainer() {
  const services = await getAdminServices();
  return <ClientServices initialServices={services} />;
}

export default async function DashboardServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 bg-base-100 flex-1 text-center">
          <span className="loading loading-spinner text-primary"></span>
          <h2 className="text-sm font-bold text-base-content/60">সার্ভিস লোড হচ্ছে...</h2>
        </div>
      }
    >
      <ServicesContainer />
    </Suspense>
  );
}
