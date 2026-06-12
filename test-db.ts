import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

async function test() {
  console.log("Checking user in database...");
  try {
    const user = await prisma.user.findUnique({
      where: { email: "sheikhmadrakib.career@gmail.com" },
    });
    if (!user) {
      console.log("User not found!");
      return;
    }
    console.log("User found:", { id: user.id, email: user.email, role: user.role });
    console.log("Hashed password:", user.password);

    const isValid = await bcrypt.compare("admin123", user.password || "");
    console.log("Password matches 'admin123':", isValid);
  } catch (error) {
    console.error("Error running test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
