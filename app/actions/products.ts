"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";

export async function getProducts(query?: string, category?: string) {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");
  try {
    return await prisma.product.findMany({
      where: {
        active: true,
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          category && category !== "All"
            ? { category: { equals: category, mode: "insensitive" } }
            : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string) {
  "use cache";
  cacheTag("products", `product-${id}`);
  cacheLife("minutes");
  try {
    return await prisma.product.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (session?.user && (session.user as any).role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const image = formData.get("image") as string || "https://picsum.photos/id/2/400/400";
  const stock = parseInt(formData.get("stock") as string) || 0;
  const category = formData.get("category") as string || "General";

  if (!name || !description || isNaN(price)) {
    return { error: "Name, description, and price are required." };
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        stock,
        category,
        active: true,
      },
    });

    updateTag("products");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true, product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product." };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user && (session.user as any).role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const image = formData.get("image") as string;
  const stock = parseInt(formData.get("stock") as string);
  const category = formData.get("category") as string;

  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (!isNaN(price)) updateData.price = price;
    if (image) updateData.image = image;
    if (!isNaN(stock)) updateData.stock = stock;
    if (category) updateData.category = category;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    updateTag("products");
    updateTag(`product-${id}`);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/dashboard");
    return { success: true, product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product." };
  }
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (session?.user && (session.user as any).role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  try {
    // Soft delete by setting active to false
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    updateTag("products");
    updateTag(`product-${id}`);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product." };
  }
}
