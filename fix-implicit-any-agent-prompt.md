# Agent Task: Fix All Implicit `any` TypeScript Errors for Vercel Deployment

## Context

This is a Next.js 16 + Prisma v7 project that deploys to Vercel. Vercel runs a **full clean TypeScript check from scratch** (no incremental cache), which enforces `noImplicitAny` strictly — even in cases where local builds pass due to `.next/` cache. The following class of errors causes deployment failures and must be pre-emptively fixed across the entire codebase.

---

## Your Job

Scan the entire workspace and fix **every instance** of the following error patterns before the next deployment. Do not skip any file. Do not rely on whether the local build passes — assume Vercel will catch everything.

---

## Error Pattern 1: Implicit `any` on `.map()` / `.forEach()` / `.filter()` callbacks from Prisma `select` queries

### How to identify it
Search for `.map(`, `.forEach(`, `.filter(`, `.find(`, `.reduce(` applied to a variable that was fetched with a Prisma `findMany`, `findFirst`, or `findUnique` call using a `select: { ... }` clause.

```ts
// ❌ Will fail on Vercel
const categories = results.map((item) => item.category);

// ✅ Fix: explicitly annotate the callback parameter to match the Prisma select shape
const categories = results.map((item: { category: string }) => item.category);
```

**Rule:** The type annotation must exactly mirror the fields listed in the `select` object for that query. If `select: { category: true, active: true }` is used, the annotation must be `{ category: string; active: boolean }` (or the real types of those fields).

---

## Error Pattern 2: Implicit `any` on `prisma.$transaction` callback parameter

### How to identify it
Search for `prisma.$transaction(async (tx)` or `prisma.$transaction((tx)`.

```ts
// ❌ Will fail on Vercel
const result = await prisma.$transaction(async (tx) => { ... });

// ✅ Fix: derive the type from the prisma instance (Prisma v7 compatible, version-agnostic)
type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
const result = await prisma.$transaction(async (tx: PrismaTx) => { ... });
```

Place the `PrismaTx` type definition at the top of the file (after imports) wherever this pattern appears. Do **not** try to import `Prisma.TransactionClient` from `@prisma/client` — Prisma v7 does not export the `Prisma` namespace that way.

---

## Error Pattern 3: Implicit `any` on `.map()` callbacks when the array has a known type but the callback parameter is unannotated

### How to identify it
The most recently observed instance is in `app/dashboard/orders/page.tsx`:

```
Type error: Parameter 'order' implicitly has an 'any' type.
> 12 | const serializedOrders: Order[] = orders.map((order) => ({
```

Even though the return type `Order[]` is declared, TypeScript on a cold check cannot infer the callback parameter type from it. Fix:

```ts
// ❌ Fails on Vercel clean build
const serializedOrders: Order[] = orders.map((order) => ({
  id: order.id,
  createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
  shippingAddress: order.shippingAddress,
  // ...
}));

// ✅ Fix: annotate the callback parameter with the Prisma model type (or inline shape)
// Import the Prisma-generated type if available:
import type { Order as PrismaOrder } from "@prisma/client";

const serializedOrders: Order[] = orders.map((order: PrismaOrder) => ({
  // ...
}));

// Or use an inline type if the query uses `select`:
const serializedOrders: Order[] = orders.map((order: { id: string; createdAt: Date; shippingAddress: string; /* all selected fields */ }) => ({
  // ...
}));
```

---

## Search Strategy — Files to Scan

Run the following searches across the **entire project** (not just `app/`):

```bash
# Find all .map( callbacks that may lack explicit typing
grep -rn "\.map((.*) =>" --include="*.ts" --include="*.tsx" .

# Find all .forEach( callbacks
grep -rn "\.forEach((.*) =>" --include="*.ts" --include="*.tsx" .

# Find all .filter( callbacks
grep -rn "\.filter((.*) =>" --include="*.ts" --include="*.tsx" .

# Find all prisma.$transaction callbacks
grep -rn "prisma\.\$transaction" --include="*.ts" --include="*.tsx" .
```

For each match, check:
1. Is the array sourced from a Prisma query (look up the variable declaration)?
2. Does the callback parameter lack an explicit type annotation?
3. If yes to both → add the explicit annotation.

---

## Priority Files (Known to Have Had Issues)

These files have already been fixed once but may have regressed or have similar patterns elsewhere in the same file:

- `app/actions/bookings.ts`
- `app/actions/checkout.ts`
- `app/categories/page.tsx`
- `app/products/page.tsx`
- `app/services/page.tsx`
- `app/dashboard/categories/page.tsx`
- `app/dashboard/orders/page.tsx` ← **current failing file, fix this first**

---

## Validation Step (Required After All Fixes)

After making all fixes, run:

```bash
npx tsc --noEmit
```

This replicates Vercel's clean TypeScript check. The command must exit with **zero errors** before you consider the task complete. If new errors appear, fix them using the same patterns above.

Also confirm:
- [ ] `.npmrc` exists in project root with `legacy-peer-deps=true`
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` completes successfully

---

## Do Not

- Do **not** add `// @ts-ignore` or `// @ts-expect-error` comments as a fix — these mask real errors.
- Do **not** use `as any` casts — these defeat the purpose of TypeScript.
- Do **not** disable `strict` or `noImplicitAny` in `tsconfig.json`.
- Do **not** import `Prisma.TransactionClient` from `@prisma/client` — it doesn't exist in Prisma v7.
- Do **not** mark the task done until `npx tsc --noEmit` passes cleanly.
