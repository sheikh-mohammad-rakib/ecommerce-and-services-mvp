# Troubleshooting Log

This file documents TypeScript and Next.js 16 (PPR / Cache Components) build issues and their resolutions.
**Read this before debugging a new build error — the solution may already be documented here.**

---

## 1. Prisma Type Error: `userId: string | undefined`

### Problem
Passing `session.user.id` directly into Prisma operations (e.g. `order.create`, `booking.create`, `notification.create`) causes a TypeScript compile error even after a null-check on `session?.user?.id`. TypeScript does not narrow a nested optional chain to `string`, and Prisma's strict union types (`OrderCreateInput | OrderUncheckedCreateInput`) reject `string | undefined`.

```
Type error: Type 'string | undefined' is not assignable to type 'undefined'.
  Type 'string' is not assignable to type 'undefined'.
```

### Files Affected
- `app/actions/checkout.ts`
- `app/actions/bookings.ts`
- `app/actions/notifications.ts`
- `app/notifications/page.tsx`

### Solution
After the null-check guard, extract `session.user.id` into a local constant cast as `string`:

```typescript
// After: if (!session?.user?.id) return { error: "Unauthorized" };
const userId = session.user.id as string;

// Then use `userId` in all Prisma calls
await prisma.order.create({ data: { userId, ... } });
```

For `session.user` passed as a prop after a redirect guard, use a non-null assertion:
```typescript
<AdminDashboard user={session.user!} />
```

---

## 2. Next.js 16 PPR Build Error: Uncached Data Outside `<Suspense>`

### Problem
With Cache Components / Partial Prerendering (PPR) enabled (`cacheComponents: true` in `next.config.ts`), Next.js prerenderers all routes at build time. Accessing **uncached dynamic data** at the page-component level — including:
- `auth()` (reads cookies/headers)
- Direct `prisma.*` queries (uncached DB calls)
- `await params` / `await searchParams` (triggers dynamic compilation)
- `useSearchParams()` hook in client components

…outside of a `<Suspense>` boundary crashes the build:

```
Error: Route "/dashboard": Uncached data was accessed outside of <Suspense>.
```

### Root Cause
The **exported page component** (the default export) is rendered as the **static shell** during build. Any async/dynamic operation it performs directly blocks the static prerender. Only code inside a `<Suspense>` boundary is allowed to be dynamic/streamed at runtime.

### Solution: The Container Pattern

Move **all** dynamic logic (auth, redirects, DB queries, params awaiting) into a separate async **Container component**. Export a static shell page that wraps the Container in `<Suspense>`:

```tsx
// ✅ Container: handles all dynamic/uncached operations
async function PageContainer() {
  const session = await auth();           // dynamic - OK inside container
  if (!session) redirect("/login");
  const data = await prisma.thing.findMany(); // uncached - OK inside container
  return <ClientComponent data={data} />;
}

// ✅ Page: static shell, no dynamic operations
export default async function Page() {
  return (
    <div className="...">
      <Suspense fallback={<p>Loading...</p>}>
        <PageContainer />
      </Suspense>
    </div>
  );
}
```

For **client components using `useSearchParams()`**, extract the hook usage into a sub-component wrapped in Suspense:

```tsx
function SuccessContent() {
  const searchParams = useSearchParams(); // dynamic - OK inside Suspense child
  return <div>...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SuccessContent />
    </Suspense>
  );
}
```

For **pages that only fetch cached/public data** (no auth, no user-specific data), use the `"use cache"` directive instead to prerender at build time:

```tsx
export default async function CategoriesPage() {
  "use cache";
  cacheTag("products", "services");
  cacheLife("minutes");
  const products = await prisma.product.findMany(...); // cached - OK
  return <div>...</div>;
}
```

### All Pages Fixed & Their Final Render Mode

| Route | Pattern Used | Build Output |
|---|---|---|
| `/` | `"use cache"` + `cacheLife("minutes")` | `○` Static (cached) |
| `/categories` | `"use cache"` + `cacheLife("minutes")` | `○` Static (cached) |
| `/cart` | Client component (`"use client"`) | `○` Static |
| `/checkout` | Client component (`"use client"`) | `○` Static |
| `/checkout/success` | `SuccessContent` + `<Suspense>` | `○` Static |
| `/login` | Client component | `○` Static |
| `/register` | Client component | `○` Static |
| `/dashboard` | `AdminDashboardContainer` + `<Suspense>` | `◐` Partial Prerender |
| `/notifications` | `NotificationsContainer` + `<Suspense>` | `◐` Partial Prerender |
| `/orders` | `OrdersContainer` + `<Suspense>` | `◐` Partial Prerender |
| `/profile` | `ProfileContainer` + `<Suspense>` | `◐` Partial Prerender |
| `/products` | `ProductsContainer` + `<Suspense>` | `◐` Partial Prerender |
| `/products/[id]` | `ProductDetailContainer` + `<Suspense>` | `◐` Partial Prerender |
| `/services` | `ServicesContainer` + `<Suspense>` | `◐` Partial Prerender |
| `/services/[id]` | `ServiceBookingContainer` + `<Suspense>` | `◐` Partial Prerender |

### Build Output Legend
- `○` **(Static)** — prerendered as static HTML at build time
- `◐` **(Partial Prerender)** — static HTML shell at build time, dynamic content streamed at runtime
- `ƒ` **(Dynamic)** — server-rendered on every request

---

## 3. `prisma.notification.update` with Compound `where` (Non-Unique Fields)

### Problem
Calling `prisma.notification.update({ where: { id, userId } })` fails because Prisma's `update()` `where` clause only accepts **unique fields**. `userId` is not unique, so this causes a type error.

### Solution
Use `prisma.notification.updateMany()` instead, which accepts non-unique `where` filters and also safely enforces user ownership:

```typescript
// ❌ Wrong - update() only allows unique where clauses
await prisma.notification.update({ where: { id, userId } });

// ✅ Correct - updateMany() supports compound non-unique where
await prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
```

---

## Build Success Confirmation

Final successful build output (achieved after all fixes above):

```
✓ Compiled successfully in 5.5s
✓ Finished TypeScript in 5.2s
✓ Collecting page data using 11 workers in 2.5s
✓ Generating static pages using 11 workers (18/18) in 3.5s
✓ Finalizing page optimization in 23ms
```
