import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "OWNER" | "BARBER" | "CLIENT";
      tenantId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "SUPER_ADMIN" | "OWNER" | "BARBER" | "CLIENT";
    tenantId?: string;
  }
}
