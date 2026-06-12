"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import * as z from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type FormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

export async function registerUser(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        errors: { email: ["This email is already registered."] },
        success: false,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    // Seed initial welcome notifications for the new customer
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "অ্যাকাউন্ট ভেরিফাই সম্পন্ন",
        message: "আপনার মোবাইল নম্বর সফলভাবে ভেরিফাই হয়েছে। আমাদের সাথে থাকার জন্য ধন্যবাদ!",
        type: "SYSTEM",
        isRead: false,
      },
    });

    return {
      success: true,
      message: "Registration successful. You can now login.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      message: "An error occurred during registration.",
      success: false,
    };
  }
}

export async function loginUser(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });

    return {
      success: true,
    };
  } catch (error) {
    // Check if it is a Next.js redirect error and rethrow it
    const err = error as { message?: string; digest?: string };
    if (
      err &&
      (err.message === "NEXT_REDIRECT" ||
        (typeof err.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")))
    ) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।", success: false };
        default:
          return { message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", success: false };
      }
    }
    console.error("Login error:", error);
    return { message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।", success: false };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
