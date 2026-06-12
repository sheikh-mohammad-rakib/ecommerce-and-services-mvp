import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth authorize] Credentials received:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth authorize] Missing email or password");
          return null;
        }

        const emailString = credentials.email as string;
        const passwordString = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email: emailString },
          });

          if (!user) {
            console.log("[Auth authorize] No user found with email:", emailString);
            return null;
          }

          console.log("[Auth authorize] User found in DB:", { id: user.id, email: user.email, role: user.role });

          if (!user.password) {
            console.log("[Auth authorize] User has no password set in DB");
            return null;
          }

          const isValid = await bcrypt.compare(passwordString, user.password);
          console.log("[Auth authorize] Password comparison result:", isValid);

          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (dbError) {
          console.error("[Auth authorize] Database error during lookup:", dbError);
          return null;
        }
      },
    }),
  ],
});
