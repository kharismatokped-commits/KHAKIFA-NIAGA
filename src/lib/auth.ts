import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // 1 hari
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 menit cache cookie sesi
    },
  },
  secret:
    process.env.BETTER_AUTH_SECRET ||
    (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("BETTER_AUTH_SECRET environment variable is required in production");
        })()
      : "dev-only-secret-do-not-use-in-production-1234567890"),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3005",
});
