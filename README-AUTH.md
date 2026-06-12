# NextAuth v5 & Prisma 7 Troubleshooting & Resolution

This document chronicles the authentication-related issues encountered during development and how they were resolved to make the mobile-first Ecommerce & Services MVP functional under Next.js 16.

---

## 🛠️ Problems Encountered & Resolutions

### 1. Peer Dependency Conflict (Next.js 16 + NextAuth v5)
* **Problem**: NextAuth v5 Beta enforces a strict peer dependency on Next.js `^14.0.0-0 || ^15.0.0-0`. Running `npm install` failed with an `ERRESOLVE unable to resolve dependency tree` error due to the project running Next.js `16.2.9`.
* **Resolution**: Bypassed strict peer checking by running:
  ```powershell
  npm install --legacy-peer-deps
  ```

### 2. Environment Variables Missing in CLI / Standalone Scripts
* **Problem**: Running CLI commands (like `npx prisma db push`) or standalone Node scripts (like `npx tsx prisma/seed.ts`) outside of the Next.js runtime resulted in errors saying `DATABASE_URL is not set`. By default, Next.js only loads `.env` variables during its server execution.
* **Resolution**: Added `import 'dotenv/config'` to the top of [prisma.config.ts](file:///d:/ecommerce-and-services-mvp/prisma.config.ts) and [lib/prisma.ts](file:///d:/ecommerce-and-services-mvp/lib/prisma.ts). This ensures environment parameters are loaded into `process.env` immediately upon file import.

### 3. Edge Runtime Compatibility Crash (Prisma/PG Driver in Middleware)
* **Problem**: Next.js compiles the routing middleware (`proxy.ts` in Next.js 16) to run in the Edge Runtime. When `proxy.ts` imported `@/auth` (`auth.ts`), it loaded the entire auth dependency graph, including the Prisma Client (`lib/prisma.ts`), which in turn imported Node-native modules (`pg` and `@prisma/adapter-pg`). The compiler crashed with `Module not found: Can't resolve '.prisma/client/default'` because Node-native TCP features cannot compile in the Edge container.
* **Resolution**: Split the NextAuth configuration using the standard architecture split pattern:
  * **[auth.config.ts](file:///d:/ecommerce-and-services-mvp/auth.config.ts)**: Contains only Edge-safe parameters (JWT strategies, page maps, and session callbacks). No database client or Node modules are imported.
  * **[proxy.ts](file:///d:/ecommerce-and-services-mvp/proxy.ts)**: Initialized NextAuth directly with `authConfig` from `auth.config.ts`.
  * **[auth.ts](file:///d:/ecommerce-and-services-mvp/auth.ts)**: Merges the base config, initializes the `PrismaAdapter` database connector, and registers the Node-native `Credentials` provider. This file is safely loaded inside Server Actions and Node-bound API routes only.

### 4. Next.js Redirect Swallowing in Server Actions
* **Problem**: In Server Actions, NextAuth's `signIn` handles successful authorization by throwing a special `NEXT_REDIRECT` error to signal Next.js to navigate the page. However, our `loginUser` action wrapped `signIn` in a generic `try/catch` block that captured *all* errors, treating the redirect as a credentials failure and returning `ইমেইল বা পাসওয়ার্ড সঠিক নয়。` to the UI.
* **Resolution**: Modified the catch block in the `loginUser` action in [app/actions/auth.ts](file:///d:/ecommerce-and-services-mvp/app/actions/auth.ts) to check for and rethrow errors whose message is `NEXT_REDIRECT` or whose digest starts with `NEXT_REDIRECT`. This lets the redirect bubble up to Next.js while successfully catching genuine auth failures (like `CredentialsSignin`).

### 5. Failed to Fetch / RSC Serialization Error in Client Invoked Actions
* **Problem**: Placing an order or booking a service resulted in a `Failed to fetch` Type Error at the client-side `fetchServerAction` invocation. This occurred because Server Actions return values are serialized across the network boundary to client components. The actions (`placeOrder`, `updateOrderStatus`, `createBooking`, `updateBookingStatus`) returned the fully loaded Prisma model instances, which included deeply nested relations and raw JavaScript `Date` objects (`createdAt`, `updatedAt`), triggering a server-side serialization crash.
* **Resolution**: Simplified the return values of these boundary Server Actions to return plain, flat objects (e.g. `{ success: true, order: { id: order.id } }` or `{ success: true, booking: { id: booking.id } }`) instead of the database models. This completely bypassed the serialization checks and resolved the crash.

### 6. Node `pg` Driver SSL Mode Warning
* **Problem**: The database driver logged warnings regarding the deprecation of connection string SSL modes: `Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'`.
* **Resolution**: Updated the `.env` database URL configuration from `sslmode=require` to `sslmode=verify-full`, fulfilling the driver's requirement and silencing the security warnings.

### 7. Admin Account Seeding Email Typo
* **Problem**: The database seed script registered the admin account with the email `sheikhmadrakib.career@gmail.com`, but the input typed on the login screen was `sheikhmdrakib.career@gmail.com` (without the `a` in `md`), resulting in "No user found" errors.
* **Resolution**: Corrected the email address in [prisma/seed.ts](file:///d:/ecommerce-and-services-mvp/prisma/seed.ts) to `sheikhmdrakib.career@gmail.com`.

