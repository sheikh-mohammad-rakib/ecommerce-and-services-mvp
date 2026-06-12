import prisma from "../lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Clear existing database records
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed passwords
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedCustomerPassword = await bcrypt.hash("customer123", 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: "Rakib",
      email: "sheikhmdrakib.career@gmail.com",
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
      mobile: "01712345678",
      address: "বাসা ৩, রোড ৫, বনানী",
      city: "ঢাকা",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: "Raj",
      email: "raj@mail.com",
      password: hashedCustomerPassword,
      role: UserRole.CUSTOMER,
      mobile: "01880301492",
      address: "বাসা ১২, রোড ৩, ধানমন্ডি",
      city: "ঢাকা",
    },
  });

  console.log("Users seeded successfully.");

  // 2. Create Products
  const gasCylinder = await prisma.product.create({
    data: {
      name: "TotalGas LPG Cylinder (12kg)",
      description: "১২ কেজি রিফিল সিলিন্ডার গ্যাস - বাসা-বাড়ির রান্নার জন্য নিরাপদ ও দীর্ঘস্থায়ী।",
      price: 1450.00,
      image: "https://picsum.photos/id/2/400/400", // Using placeholder images per DaisyUI skill instructions
      stock: 35,
      active: true,
      category: "Gas cylinder",
    },
  });

  const gasDelivery = await prisma.product.create({
    data: {
      name: "১২ কেজি গ্যাস সিলিন্ডার ডেলিভারি",
      description: "১২ কেজি গ্যাস সিলিন্ডার ও হোম ডেলিভারি সার্ভিস।",
      price: 1250.00,
      image: "https://picsum.photos/id/10/400/400",
      stock: 100,
      active: true,
      category: "Gas cylinder",
    },
  });

  const splitAC = await prisma.product.create({
    data: {
      name: "Haier Split AC (1.5 Ton)",
      description: "Haier Energy Saving Split AC with 1.5 Ton capacity, 3-star energy efficiency.",
      price: 49500.00,
      image: "https://picsum.photos/id/15/400/400",
      stock: 8,
      active: true,
      category: "Air Conditioner",
    },
  });

  const waltonFridge = await prisma.product.create({
    data: {
      name: "Walton Fridge (WFB-2B6-R)",
      description: "Walton 264 Liter double door refrigerator in classic rich red gloss design.",
      price: 28800.00,
      image: "https://picsum.photos/id/20/400/400",
      stock: 12,
      active: true,
      category: "Fridge",
    },
  });

  console.log("Products seeded successfully.");

  // 3. Create Services
  const acService = await prisma.service.create({
    data: {
      name: "এসি রিপেয়ার ও সার্ভিসিং",
      description: "অভিজ্ঞ টেকনিশিয়ান দ্বারা প্রফেশনাল এসি সার্ভিসিং ও ক্লিনিং।",
      price: 1200.00,
      duration: 60,
      image: "https://picsum.photos/id/22/400/400",
      active: true,
      category: "Air Conditioner",
    },
  });

  const carService = await prisma.service.create({
    data: {
      name: "Car Service & Engine Tuning",
      description: "Complete vehicle maintenance, engine check, and tuning service.",
      price: 1500.00,
      duration: 120,
      image: "https://picsum.photos/id/28/400/400",
      active: true,
      category: "Car service",
    },
  });

  const fridgeService = await prisma.service.create({
    data: {
      name: "Fridge Maintenance Repairing",
      description: "Quick repair of cooling problems and gas charge for all refrigerator brands.",
      price: 800.00,
      duration: 90,
      image: "https://picsum.photos/id/35/400/400",
      active: true,
      category: "Fridge",
    },
  });

  console.log("Services seeded successfully.");

  // 4. Create Mock Orders (Recent Orders in screenshots)
  // Order 1: #EF1DBO by Raj - TotalGas (12kg), 1x 1450 + 60 delivery = 1510
  const order1 = await prisma.order.create({
    data: {
      id: "EF1DBO",
      userId: customerUser.id,
      shippingAddress: customerUser.address,
      city: customerUser.city,
      mobile: customerUser.mobile,
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "PENDING",
      status: "PENDING",
      totalAmount: 1510.00,
      createdAt: new Date("2026-06-12T01:30:00Z"),
      items: {
        create: {
          productId: gasCylinder.id,
          quantity: 1,
          price: 1450.00,
        },
      },
    },
  });

  // Order 2: #IJP4TJ by Rakib - Gas Delivery, 1x 1250 + 60 delivery = 1310
  const order2 = await prisma.order.create({
    data: {
      id: "IJP4TJ",
      userId: adminUser.id,
      shippingAddress: adminUser.address,
      city: adminUser.city,
      mobile: adminUser.mobile,
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "PENDING",
      status: "PENDING",
      totalAmount: 1310.00,
      createdAt: new Date("2026-05-29T10:00:00Z"),
      items: {
        create: {
          productId: gasDelivery.id,
          quantity: 1,
          price: 1250.00,
        },
      },
    },
  });

  // Order 3: #2HQHRW by Rakib - Gas Delivery, 3x 1250 = 3750 + 60 delivery = 3810
  const order3 = await prisma.order.create({
    data: {
      id: "2HQHRW",
      userId: adminUser.id,
      shippingAddress: adminUser.address,
      city: adminUser.city,
      mobile: adminUser.mobile,
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "PENDING",
      status: "PENDING",
      totalAmount: 3810.00,
      createdAt: new Date("2026-05-29T08:00:00Z"),
      items: {
        create: {
          productId: gasDelivery.id,
          quantity: 3,
          price: 1250.00,
        },
      },
    },
  });

  // Order 4: #NRBOVA by Raj - Haier AC, 1x 49500 + 60 delivery = 49560
  const order4 = await prisma.order.create({
    data: {
      id: "NRBOVA",
      userId: customerUser.id,
      shippingAddress: customerUser.address,
      city: customerUser.city,
      mobile: customerUser.mobile,
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "PENDING",
      status: "PENDING",
      totalAmount: 49560.00,
      createdAt: new Date("2026-05-27T14:20:00Z"),
      items: {
        create: {
          productId: splitAC.id,
          quantity: 1,
          price: 49500.00,
        },
      },
    },
  });

  console.log("Orders seeded successfully.");

  // 5. Create Mock Bookings
  await prisma.booking.create({
    data: {
      userId: customerUser.id,
      serviceId: acService.id,
      date: new Date("2026-06-15T00:00:00Z"),
      timeSlot: "10:00 AM",
      paymentMethod: "PAY_ON_SERVICE",
      paymentStatus: "PENDING",
      status: "CONFIRMED",
    },
  });

  await prisma.booking.create({
    data: {
      userId: customerUser.id,
      serviceId: carService.id,
      date: new Date("2026-06-16T00:00:00Z"),
      timeSlot: "02:00 PM",
      paymentMethod: "PAY_ON_SERVICE",
      paymentStatus: "PENDING",
      status: "PENDING",
    },
  });

  console.log("Bookings seeded successfully.");

  // 6. Create Notifications (matching Notifications screenshot)
  // 3 Unread notifications
  await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: "আপনার অর্ডার ডেলিভারি হয়েছে",
      message: "অর্ডার #DCORD001 সফলভাবে ডেলিভারি সম্পন্ন হয়েছে। ধন্যবাদ!",
      type: "DELIVERY",
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
  });

  await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: "🔥 বিশেষ অফার! ২০% ছাড়",
      message: "সব এসি সার্ভিসিং-এ ২০% ছাড় পাচ্ছেন এই সপ্তাহে। কোড: COOL20",
      type: "PROMO",
      isRead: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
  });

  await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: "অর্ডার কনফার্ম হয়েছে",
      message: "অর্ডার #DCORD003 কনফার্ম হয়েছে। শীঘ্রই প্রসেসিং শুরু হবে।",
      type: "CONFIRM",
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  });

  // Read notifications
  await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: "অ্যাকাউন্ট ভেরিফাই সম্পন্ন",
      message: "আপনার মোবাইল নম্বর সফলভাবে ভেরিফাই হয়েছে।",
      type: "SYSTEM",
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  console.log("Notifications seeded successfully.");
  console.log("Database seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
