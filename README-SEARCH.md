# 🔍 Contextual Search Layout Fix — Categories Page

This document explains the issue and resolution for the duplicate search inputs layout bug on the Categories page (`/categories`).

---

## 🚨 The Issue
On the Categories page, the header was rendering two search bars stacked vertically:
1. **General Search:** `"পণ্য বা সার্ভিস খুঁজুন..."` (Products or services)
2. **Brand/Category Search:** `"পণ্য বা ব্র্যান্ড খুঁজুন..."` (Products or brands)

### Visual Impact
- **Excessive Header Height:** The stacked inputs stretched the header height to `152px` (compared to the standard `106px` on other pages).
- **Layout Clutter:** Having two search inputs stacked inside a mobile container (`max-w-md`) created a redundant, cramped, and visually broken header alignment, which was flagged via the browser layout review.
- **Redundant Functionality:** Both search bars served similar contextual purposes on the categories page, making them redundant.

---

## 🛠️ The Solution

### 1. Conditional Search Bar Rendering
We updated the general search bar in [navbar.tsx](file:///d:/ecommerce-and-services-mvp/app/ui/navbar.tsx) to be hidden on the `/categories` page:
```tsx
{/* Search 1: Product / Service search */}
{pathname !== "/categories" && (
  <form onSubmit={handleSearchSubmit} className="relative w-full">
    {/* ... */}
  </form>
)}
```
Now:
- On the **Categories Page** (`/categories`), only the contextual **Brand/Product Search** is displayed.
- On **all other pages** (Home, Products list, Services list), only the **General Search** bar is displayed.
- The header height on the Categories page is reduced back to the standard layout height, aligning perfectly with no vertical spacing issues or visual clutter.

### 2. Categories Page Theme Synchronization
In addition to the navbar fix, we updated the hardcoded color and layout style classes in [app/categories/page.tsx](file:///d:/ecommerce-and-services-mvp/app/categories/page.tsx) to conform to the new `dreamcare` theme system:
- Mapped page background from raw `#050811` to `bg-base-100`.
- Updated category grid card container styles from `#0d1222`/`border-zinc-800` to `bg-base-200`/`border-base-300/30`.
- Aligned typography and titles to utilize the semantic text tokens (`text-base-content`, `text-base-content/50`).
