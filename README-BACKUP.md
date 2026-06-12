# Project State Backup (2026-06-12)

This file serves as a reference of all modified and created files in the repository as of June 12, 2026. If any functionality is broken, use this list to identify files that need recovery or rollback.

---

## 📂 Custom configurations & Env

* **[package.json](file:///d:/ecommerce-and-services-mvp/package.json)**:
  * Added core Prisma, Postgres, NextAuth, bcrypt, lucide-react, and zod dependencies.
* **[.env](file:///d:/ecommerce-and-services-mvp/.env)**:
  * Contains `DATABASE_URL` (with `sslmode=verify-full`), `AUTH_SECRET`, and `NEXTAUTH_URL`.
* **[.env.example](file:///d:/ecommerce-and-services-mvp/.env.example)**:
  * Template for environment variables.
* **[next.config.ts](file:///d:/ecommerce-and-services-mvp/next.config.ts)**:
  * Next.js build options.

---

## 📂 Database Layer (Prisma)

* **[prisma/schema.prisma](file:///d:/ecommerce-and-services-mvp/prisma/schema.prisma)**:
  * Full schema containing models for User, Account, Session, Product, Service, Booking, Order, OrderItem, and Notification. Conforms to Prisma 7 (no local datasource URL, connection defined in config).
* **[prisma.config.ts](file:///d:/ecommerce-and-services-mvp/prisma.config.ts)**:
  * Prisma 7 configuration file. Loads `.env` via `dotenv/config`.
* **[lib/prisma.ts](file:///d:/ecommerce-and-services-mvp/lib/prisma.ts)**:
  * Prisma client singleton. Loads `.env` via `dotenv/config` for CLI compatibility.
* **[prisma/seed.ts](file:///d:/ecommerce-and-services-mvp/prisma/seed.ts)**:
  * Seed database records with mock products, services, test admin user (`sheikhmdrakib.career@gmail.com`), customer (`raj@mail.com`), and notifications.

---

## 📂 Authentication (Auth.js v5)

* **[auth.config.ts](file:///d:/ecommerce-and-services-mvp/auth.config.ts)**:
  * Edge-safe auth configuration settings. No database imports.
* **[auth.ts](file:///d:/ecommerce-and-services-mvp/auth.ts)**:
  * Database-enabled auth configuration using PrismaAdapter and CredentialsProvider.
* **[proxy.ts](file:///d:/ecommerce-and-services-mvp/proxy.ts)**:
  * Next.js 16 Edge middleware replacement for route protection. Initializes auth strictly with `authConfig` from `auth.config.ts`.
* **[app/api/auth/[...nextauth]/route.ts](file:///d:/ecommerce-and-services-mvp/app/api/auth/%5B...nextauth%5D/route.ts)**:
  * NextAuth API handlers.
* **[app/actions/auth.ts](file:///d:/ecommerce-and-services-mvp/app/actions/auth.ts)**:
  * Server Actions for registration, login (rethrows `NEXT_REDIRECT` errors), and logout.

---

## 📂 Server Actions (Business Logic)

* **[app/actions/checkout.ts](file:///d:/ecommerce-and-services-mvp/app/actions/checkout.ts)**:
  * Handles order placements and status updates. Simplifies return values (returns `{ id: order.id }` rather than the fully loaded relation model to avoid RSC serialization date/nested crashes).
* **[app/actions/bookings.ts](file:///d:/ecommerce-and-services-mvp/app/actions/bookings.ts)**:
  * Handles time slot queries, service bookings, and status updates. Simplifies return values to prevent serialization crashes.
* **[app/actions/products.ts](file:///d:/ecommerce-and-services-mvp/app/actions/products.ts)**:
  * Handles products lists and admin mutations.
* **[app/actions/notifications.ts](file:///d:/ecommerce-and-services-mvp/app/actions/notifications.ts)**:
  * Handles customer notification marks.

---

## 📂 Components & Views

* **[app/ui/navbar.tsx](file:///d:/ecommerce-and-services-mvp/app/ui/navbar.tsx)**:
  * Global app navbar. Automatically hides on login/register and `/dashboard` screens.
* **[app/ui/bottom-nav.tsx](file:///d:/ecommerce-and-services-mvp/app/ui/bottom-nav.tsx)**:
  * Sticky bottom navigation bar.
* **[app/dashboard/admin-dashboard.tsx](file:///d:/ecommerce-and-services-mvp/app/dashboard/admin-dashboard.tsx)**:
  * Admin dashboard client component (KPIs, Weekly orders chart, Recent orders log).
* **[app/checkout/page.tsx](file:///d:/ecommerce-and-services-mvp/app/checkout/page.tsx)**:
  * Checkout page.
* **[app/services/[id]/service-booking-client.tsx](file:///d:/ecommerce-and-services-mvp/app/services/%5Bid%5D/service-booking-client.tsx)**:
  * Scheduling time slot booking component.

---

## 📂 Best Practices & Optimizations (June 12, 2026)

The following files were modified to apply optimized Next.js patterns, resolve RSC boundary data serialization issues, mitigate hydration warnings, and prevent build-time static generation deoptimization:

* **[app/layout.tsx](file:///d:/ecommerce-and-services-mvp/app/layout.tsx)**:
  * Wrapped `<Navbar />` and `<BottomNav />` in `<Suspense>` boundaries to avoid build-time deoptimization of static generation.
* **[app/page.tsx](file:///d:/ecommerce-and-services-mvp/app/page.tsx)**:
  * Serialized product/service arrays by stripping `Date` attributes before passing them across the RSC boundary.
* **[app/products/page.tsx](file:///d:/ecommerce-and-services-mvp/app/products/page.tsx)**:
  * Stripped Date objects from product objects before rendering `<ClientHomeComponents>`.
* **[app/services/page.tsx](file:///d:/ecommerce-and-services-mvp/app/services/page.tsx)**:
  * Stripped Date objects from service objects before rendering `<ClientHomeComponents>`.
* **[app/orders/page.tsx](file:///d:/ecommerce-and-services-mvp/app/orders/page.tsx)**:
  * Mapped prisma orders/bookings to convert `Date` properties into ISO string format before passing to client components.
* **[app/orders/client-orders.tsx](file:///d:/ecommerce-and-services-mvp/app/orders/client-orders.tsx)**:
  * Swapped native `<img>` tags for optimized `<Image>` components with dimensions (`width={64} height={64}`). Updated `Order` & `Booking` typescript interfaces to accept `Date | string`.
* **[app/products/[id]/product-detail-client.tsx](file:///d:/ecommerce-and-services-mvp/app/products/%5Bid%5D/product-detail-client.tsx)**:
  * Replaced native `<img>` tag with Next.js `<Image>` component (`width={400} height={400}`).
* **[app/services/[id]/service-booking-client.tsx](file:///d:/ecommerce-and-services-mvp/app/services/%5Bid%5D/service-booking-client.tsx)**:
  * Replaced native `<img>` tag with Next.js `<Image>` component (`width={64} height={64}`).
* **[app/checkout/page.tsx](file:///d:/ecommerce-and-services-mvp/app/checkout/page.tsx)**:
  * Replaced native `<img>` tag in checkout summary items list with `<Image>` component (`width={32} height={32}`).
* **[app/ui/client-home-components.tsx](file:///d:/ecommerce-and-services-mvp/app/ui/client-home-components.tsx)**:
  * Upgraded native `<img>` elements for both products and services inside the dynamic listing tabs to `<Image>` components (`width={200} height={200}`).
* **[app/notifications/page.tsx](file:///d:/ecommerce-and-services-mvp/app/notifications/page.tsx)**:
  * Serialized notification `createdAt` dates into strings before passing down to client components.
* **[app/notifications/client-notifications.tsx](file:///d:/ecommerce-and-services-mvp/app/notifications/client-notifications.tsx)**:
  * Added a `mounted` state hook pattern to format relative time-ago strings only on the client side, resolving potential SSR hydration mismatch warnings.
* **[app/dashboard/page.tsx](file:///d:/ecommerce-and-services-mvp/app/dashboard/page.tsx)**:
  * Serialized the recent orders' date fields before passing to the dashboard client component.
* **[app/dashboard/admin-dashboard.tsx](file:///d:/ecommerce-and-services-mvp/app/dashboard/admin-dashboard.tsx)**:
  * Fixed Weekly Orders chart heights to use percentages (`%`) instead of pixels (`px`).
* **[next.config.ts](file:///d:/ecommerce-and-services-mvp/next.config.ts)**:
  * Enabled Next.js 16 Cache Components feature (`cacheComponents: true`).
* **[app/actions/products.ts](file:///d:/ecommerce-and-services-mvp/app/actions/products.ts)**:
  * Implemented `'use cache'`, automatic tag keys (`'products'`, `'product-' + id`), and lifetime rules for products queries. Added tag-based immediate cache updates (`updateTag`) to mutations.
* **[app/actions/bookings.ts](file:///d:/ecommerce-and-services-mvp/app/actions/bookings.ts)**:
  * Implemented `'use cache'` and tag keys (`'services'`, `'service-' + id`, `'booked-slots-' + serviceId`) for service listings and slot queries. Added tag-based immediate cache updates (`updateTag`) to booking and service creation actions.

