"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Derive the transaction client type from the prisma instance (Prisma v7 compatible)
type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
import { revalidatePath } from "next/cache";

type CartItemInput = {
  productId: string;
  quantity: number;
  price: number;
};

// Create a new order with products
export async function placeOrder(params: {
  items: CartItemInput[];
  shippingAddress: string;
  city: string;
  mobile: string;
  paymentMethod: string; // "CASH_ON_DELIVERY", "BKASH", "NAGAD"
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please login to complete checkout." };
  }

  const userId = session.user.id as string;
  const { items, shippingAddress, city, mobile, paymentMethod } = params;

  if (!items || items.length === 0) {
    return { error: "Your cart is empty." };
  }
  if (!shippingAddress || !city || !mobile) {
    return { error: "Please fill in all shipping details." };
  }

  try {
    // 1. Calculate totals and check stocks
    let subtotal = 0;
    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!dbProduct) {
        return { error: `Product not found.` };
      }

      if (dbProduct.stock < item.quantity) {
        return { error: `Sorry, not enough stock for "${dbProduct.name}". Only ${dbProduct.stock} left.` };
      }

      subtotal += dbProduct.price * item.quantity;
    }

    const deliveryFee = 60; // ৳ 60 delivery charge as per screenshots
    const grandTotal = subtotal + deliveryFee;

    // Generate a unique 8-character uppercase order ID like #VHV6B20E
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomId = "";
    for (let i = 0; i < 8; i++) {
      randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // 2. Perform Transaction: Create Order, create OrderItems, decrement stocks
    const order = await prisma.$transaction(async (tx: PrismaTx) => {
      // Decrement stock levels
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create Order
      return await tx.order.create({
        data: {
          id: randomId,
          userId,
          shippingAddress,
          city,
          mobile,
          paymentMethod,
          paymentStatus: "PENDING",
          status: "PENDING",
          totalAmount: grandTotal,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });
    });

    // 3. Create a confirmation notification for the customer
    await prisma.notification.create({
      data: {
        userId,
        title: "অর্ডার কনফার্ম হয়েছে",
        message: `আপনার অর্ডার #${order.id} কনফার্ম হয়েছে। মোট মূল্য: ৳ ${grandTotal} (ক্যাশ অন ডেলিভারি)। শীঘ্রই প্রসেসিং শুরু হবে।`,
        type: "CONFIRM",
        isRead: false,
      },
    });

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true, order: { id: order.id } };
  } catch (error) {
    console.error("Error placing order:", error);
    return { error: "Failed to place order. Please try again." };
  }
}

// Fetch order history (Admin gets all, Customer gets their own)
export async function getOrders() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id as string;
  const role = (session.user as { role?: string }).role;

  try {
    if (role === "ADMIN") {
      return await prisma.order.findMany({
        include: { user: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return await prisma.order.findMany({
        where: { userId },
        include: { user: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

// Update order status (Admin only)
export async function updateOrderStatus(orderId: string, status: string, paymentStatus?: string) {
  const session = await auth();
  if (session?.user && (session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!currentOrder) return { error: "Order not found." };

    const updateData: { status: string; paymentStatus?: string } = { status };
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Create delivery/status update notification
    let notificationTitle = "অর্ডার আপডেট";
    let notificationMsg = `আপনার অর্ডার #${orderId} এর অবস্থা পরিবর্তন হয়েছে: ${status}`;

    if (status === "DELIVERED") {
      notificationTitle = "আপনার অর্ডার ডেলিভারি হয়েছে";
      notificationMsg = `অর্ডার #${orderId} সফলভাবে ডেলিভারি সম্পন্ন হয়েছে। ধন্যবাদ!`;
    } else if (status === "CONFIRMED") {
      notificationTitle = "অর্ডার কনফার্ম হয়েছে";
      notificationMsg = `আপনার অর্ডার #${orderId} কনফার্ম করা হয়েছে এবং প্যাকেজিং শুরু হয়েছে।`;
    } else if (status === "SHIPPED") {
      notificationTitle = "অর্ডার অন-দ্য-ওয়ে";
      notificationMsg = `আপনার অর্ডার #${orderId} কুরিয়ারে হস্তান্তর করা হয়েছে। শীঘ্রই পৌঁছে যাবে।`;
    } else if (status === "CANCELLED") {
      notificationTitle = "অর্ডার বাতিল হয়েছে";
      notificationMsg = `দুঃখিত, আপনার অর্ডার #${orderId} বাতিল করা হয়েছে।`;
    }

    await prisma.notification.create({
      data: {
        userId: currentOrder.userId,
        title: notificationTitle,
        message: notificationMsg,
        type: status === "DELIVERED" ? "DELIVERY" : (status === "CONFIRMED" ? "CONFIRM" : "SYSTEM"),
        isRead: false,
      },
    });

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true, order: { id: order.id } };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Failed to update order status." };
  }
}
