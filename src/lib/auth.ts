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
  secret: process.env.BETTER_AUTH_SECRET || "925b97d06cb78c6471e437417a07e37896f2c80727fa147f3c8ab42582ca143b",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3005",
});
