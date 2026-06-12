# 🚀 Dream Care — Deployment Troubleshooting Guide

> A chronological log of every issue encountered during Vercel deployment and exactly how each one was resolved.

---

## Problem 1: `npm install` Failed — Peer Dependency Conflict

### Error
```
npm error ERESOLVE could not resolve
npm error peer next@"^14.0.0-0 || ^15.0.0-0" from next-auth@5.0.0-beta.25
npm error Found: next@16.2.9
```

### Root Cause
`next-auth@5.0.0-beta.25` officially declares a peer dependency on Next.js 14 or 15 only.
This project uses **Next.js 16.2.9**, which is outside that range.

Locally, the project installed successfully because `npm install --legacy-peer-deps` was used originally.
Vercel always does a **clean `npm install`** without any extra flags, so it failed.

### Fix
Created a `.npmrc` file in the project root with one line:

```ini
# .npmrc
legacy-peer-deps=true
```

npm automatically reads `.npmrc` in any environment, including Vercel's build servers.
This tells npm to use `--legacy-peer-deps` for every install without requiring any manual flag.

**Files changed:** `.npmrc` *(new file)*

---

## Problem 2: TypeScript Error — Implicit `any` on `.map()` Callback

### Error
```
./app/actions/bookings.ts:73:26
Type error: Parameter 'b' implicitly has an 'any' type.

> 73 |     return bookings.map((b) => b.timeSlot);
```

### Root Cause
`tsconfig.json` has `"strict": true` enabled, which includes `noImplicitAny`.

Locally, Next.js uses **incremental TypeScript checking** with a `.next/` cache, which already has
inferred types from previous builds. This masks implicit `any` errors.

Vercel does a **full clean TypeScript check from scratch** with no cache, so TypeScript could not
infer the type of `b` without the cache.

The query used `select: { timeSlot: true }`, which returns `{ timeSlot: string }[]`, but
TypeScript on a cold check can't always propagate that narrowed type into the callback.

### Fix
Added an explicit type annotation to the `.map()` callback parameter:

```typescript
// Before
return bookings.map((b) => b.timeSlot);

// After
return bookings.map((b: { timeSlot: string }) => b.timeSlot);
```

**Files changed:** `app/actions/bookings.ts`

---

## Problem 3: TypeScript Error — Implicit `any` on Prisma `$transaction` Callback

### Error
```
./app/actions/checkout.ts:66:52
Type error: Parameter 'tx' implicitly has an 'any' type.

> 66 |     const order = await prisma.$transaction(async (tx) => {
```

### Root Cause
Same root cause as Problem 2 — Vercel's clean TypeScript check cannot infer the type of `tx`
inside a `prisma.$transaction()` callback without the incremental cache.

### Fix (Attempt 1 — Failed)
Tried importing `Prisma` namespace from `@prisma/client`:

```typescript
import { Prisma } from "@prisma/client";
// ...
const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
```

**This failed** with a new error: `Module '"@prisma/client"' has no exported member 'Prisma'`
because Prisma v7 does not export the `Prisma` namespace this way.

### Fix (Attempt 2 — Success)
Used TypeScript's `Parameters<>` utility type to extract the transaction client type
directly from the `prisma` instance, making it version-agnostic:

```typescript
// Derive the transaction client type from the prisma instance (Prisma v7 compatible)
type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Then annotate the callback:
const order = await prisma.$transaction(async (tx: PrismaTx) => {
```

**How it works:**
- `typeof prisma.$transaction` → the `$transaction` method type
- `Parameters<...>[0]` → the first parameter (the async callback function)
- `Parameters<...>[0]` again → the callback's first parameter (the `tx` client)

This approach is **version-agnostic** — it always derives the correct type from whatever
version of Prisma is installed, and will never go out of sync.

**Files changed:** `app/actions/checkout.ts`

---

## Problem 4: TypeScript Errors — Implicit `any` on Prisma `select` Query Callbacks

### Error
```
./app/categories/page.tsx:15:62
Type error: Parameter 'p' implicitly has an 'any' type.

> 15 |   const productCategories = Array.from(new Set(products.map((p) => p.category)));
```

### Root Cause
All three pages used `prisma.*.findMany({ select: { category: true } })` to fetch only the
`category` field, then immediately used `.map()` or `.forEach()` on the result.

Vercel's clean TypeScript check could not propagate the narrowed Prisma select return type
(`{ category: string }[]`) into the callback parameters.

**Affected files:**
- `app/categories/page.tsx` — two callbacks: `(p)` and `(s)`
- `app/products/page.tsx` — one callback: `(p)`
- `app/services/page.tsx` — one callback: `(s)`
- `app/dashboard/categories/page.tsx` — two callbacks: `(p)` and `(s)`

### Fix
Added explicit type annotations matching the Prisma `select` shape to all affected callbacks:

```typescript
// app/categories/page.tsx
// Before
const productCategories = Array.from(new Set(products.map((p) => p.category)));
const serviceCategories = Array.from(new Set(services.map((s) => s.category)));

// After
const productCategories = Array.from(new Set(products.map((p: { category: string }) => p.category)));
const serviceCategories = Array.from(new Set(services.map((s: { category: string }) => s.category)));

// app/dashboard/categories/page.tsx
// Before
products.forEach((p) => { ... });
services.forEach((s) => { ... });

// After
products.forEach((p: { category: string; active: boolean }) => { ... });
services.forEach((s: { category: string; active: boolean }) => { ... });
```

**Files changed:**
- `app/categories/page.tsx`
- `app/products/page.tsx`
- `app/services/page.tsx`
- `app/dashboard/categories/page.tsx`

---

## Key Takeaway: Why Vercel Catches Errors That Local Builds Don't

| | Local Build | Vercel Build |
|---|---|---|
| TypeScript check | Incremental (uses `.next/` cache) | Full clean check from scratch |
| `noImplicitAny` enforcement | Partially masked by type cache | Fully enforced |
| `npm install` | Already done with `--legacy-peer-deps` | Fresh install, reads `.npmrc` |
| Speed | Fast (incremental) | Slower (clean) |

### Prevention Rule
**Any callback on a Prisma result that uses `select: { ... }`** should always have an explicit
type annotation on the callback parameter. Example:

```typescript
// ✅ Safe for Vercel
const categories = results.map((item: { category: string }) => item.category);

// ⚠️ Works locally but may fail on Vercel clean build
const categories = results.map((item) => item.category);
```

---

## Final Deployment Checklist

Before pushing to production, verify:

- [ ] `.npmrc` with `legacy-peer-deps=true` is present in the project root
- [ ] `NEXTAUTH_URL` is set to the production domain in Vercel environment variables
- [ ] `AUTH_SECRET` is set in Vercel environment variables
- [ ] `DATABASE_URL` (Neon PostgreSQL connection string) is set in Vercel environment variables
- [ ] `npm run build` passes locally with zero TypeScript errors
- [ ] Database is accessible from Vercel's deployment region (Neon is cloud-hosted — ✅)