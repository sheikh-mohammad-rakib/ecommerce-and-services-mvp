"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, cacheLife, cacheTag, updateTag } from "next/cache";

export async function getServices(query?: string, category?: string) {
  "use cache";
  cacheTag("services");
  cacheLife("minutes");
  try {
    return await prisma.service.findMany({
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
    console.error("Error fetching services:", error);
    return [];
  }
}

export async function getServiceById(id: string) {
  "use cache";
  cacheTag("services", `service-${id}`);
  cacheLife("minutes");
  try {
    return await prisma.service.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    return null;
  }
}

// Fetch all booked slots for a specific service on a specific date
export async function getBookedSlots(serviceId: string, dateString: string) {
  "use cache";
  cacheTag(`booked-slots-${serviceId}`);
  cacheLife("minutes");
  try {
    const targetDate = new Date(dateString);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const bookings = await prisma.booking.findMany({
      where: {
        serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: "CANCELLED" },
      },
      select: { timeSlot: true },
    });

    return bookings.map((b: { timeSlot: string }) => b.timeSlot);
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return [];
  }
}

// Create a new service appointment booking
export async function createBooking(serviceId: string, dateString: string, timeSlot: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please login to book a service." };
  }

  const userId = session.user.id as string;

  try {
    const targetDate = new Date(dateString);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Double check availability
    const conflict = await prisma.booking.findFirst({
      where: {
        serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        timeSlot,
        status: { not: "CANCELLED" },
      },
    });

    if (conflict) {
      return { error: "This time slot is already booked. Please choose another." };
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return { error: "Service not found." };

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        date: new Date(dateString),
        timeSlot,
        paymentMethod: "PAY_ON_SERVICE",
        paymentStatus: "PENDING",
        status: "PENDING",
      },
    });

    // Create a confirmation notification for the customer
    await prisma.notification.create({
      data: {
        userId,
        title: "সার্ভিস বুকিং পেন্ডিং রয়েছে",
        message: `আপনার "${service.name}" বুকিং (${dateString} - ${timeSlot}) পেন্ডিং অবস্থায় রয়েছে। আমরা শীঘ্রই কনফার্ম করব।`,
        type: "CONFIRM",
        isRead: false,
      },
    });

    updateTag(`booked-slots-${serviceId}`);
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true, booking: { id: booking.id } };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { error: "Failed to place booking." };
  }
}

// Fetch user bookings (Admin gets all, Customer gets their own)
export async function getBookings() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id as string;
  const role = (session.user as { role?: string }).role;

  try {
    if (role === "ADMIN") {
      return await prisma.booking.findMany({
        include: { user: true, service: true },
        orderBy: { date: "desc" },
      });
    } else {
      return await prisma.booking.findMany({
        where: { userId },
        include: { service: true },
        orderBy: { date: "desc" },
      });
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

// Update booking status (Admin only)
export async function updateBookingStatus(bookingId: string, status: string, paymentStatus?: string) {
  const session = await auth();
  if (session?.user && (session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  try {
    const currentBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!currentBooking) return { error: "Booking not found." };

    const updateData: { status: string; paymentStatus?: string } = { status };
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    // Send notifications to the user about status changes
    let notificationTitle = "বুকিং আপডেট";
    let notificationMsg = `আপনার বুকিং আপডেট করা হয়েছে।`;

    if (status === "CONFIRMED") {
      notificationTitle = "বুকিং কনফার্ম হয়েছে";
      notificationMsg = `আপনার "${currentBooking.service.name}" বুকিংটি কনফার্ম করা হয়েছে। আমাদের টেকনিশিয়ান সময়মত পৌঁছে যাবেন।`;
    } else if (status === "CANCELLED") {
      notificationTitle = "বুকিং বাতিল করা হয়েছে";
      notificationMsg = `দুঃখিত, আপনার "${currentBooking.service.name}" বুকিংটি বাতিল করা হয়েছে।`;
    }

    await prisma.notification.create({
      data: {
        userId: currentBooking.userId,
        title: notificationTitle,
        message: notificationMsg,
        type: status === "CONFIRMED" ? "CONFIRM" : "SYSTEM",
        isRead: false,
      },
    });

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true, booking: { id: booking.id } };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { error: "Failed to update booking." };
  }
}

// Admin create service
export async function createService(formData: FormData) {
  const session = await auth();
  if (session?.user && (session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const duration = parseInt(formData.get("duration") as string) || 60;
  const image = formData.get("image") as string || "https://picsum.photos/id/22/400/400";
  const category = formData.get("category") as string || "General";

  if (!name || !description || isNaN(price)) {
    return { error: "Name, description, and price are required." };
  }

  try {
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        duration,
        image,
        category,
        active: true,
      },
    });

    updateTag("services");
    revalidatePath("/services");
    revalidatePath("/dashboard");
    return { success: true, service };
  } catch (error) {
    console.error("Error creating service:", error);
    return { error: "Failed to create service." };
  }
}

export async function updateService(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user && (session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const duration = parseInt(formData.get("duration") as string);
  const image = formData.get("image") as string;
  const category = formData.get("category") as string;

  try {
    const updateData: { name?: string; description?: string; price?: number; duration?: number; image?: string; category?: string } = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (!isNaN(price)) updateData.price = price;
    if (!isNaN(duration)) updateData.duration = duration;
    if (image) updateData.image = image;
    if (category) updateData.category = category;

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    updateTag("services");
    updateTag(`service-${id}`);
    revalidatePath("/services");
    revalidatePath(`/services/${id}`);
    revalidatePath("/dashboard");
    return { success: true, service };
  } catch (error) {
    console.error("Error updating service:", error);
    return { error: "Failed to update service." };
  }
}

export async function deleteService(id: string) {
  const session = await auth();
  if (session?.user && (session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  try {
    // Soft delete by setting active to false
    await prisma.service.update({
      where: { id },
      data: { active: false },
    });

    updateTag("services");
    updateTag(`service-${id}`);
    revalidatePath("/services");
    revalidatePath(`/services/${id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { error: "Failed to delete service." };
  }
}
