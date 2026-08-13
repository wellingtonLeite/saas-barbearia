---
name: next-auth-v5
description: Guidelines and documentation for Auth.js (NextAuth.js v5). Use this skill whenever implementing or debugging authentication, sessions, OAuth, or the auth() function in Next.js 16.
---

# NextAuth.js v5 (Auth.js) Best Practices

NextAuth.js has transitioned to v5, heavily adapting to React Server Components and Next.js App Router conventions.

## Core Concepts

1. **Universal `auth()` function:**
   - In v5, `getServerSession`, `getSession`, and `withAuth` are largely replaced by a single, universal `auth()` function in server contexts.

2. **Initialization (`auth.ts` or `auth.config.ts`)**:
   ```typescript
   // auth.ts
   import NextAuth from "next-auth"
   import { PrismaAdapter } from "@auth/prisma-adapter"
   import { prisma } from "@/prisma"
   // ... providers

   export const { handlers, auth, signIn, signOut } = NextAuth({
     adapter: PrismaAdapter(prisma),
     providers: [
        // Providers here
     ],
     session: { strategy: "jwt" },
   })
   ```

3. **API Route (`app/api/auth/[...nextauth]/route.ts`)**:
   ```typescript
   import { handlers } from "@/auth"
   export const { GET, POST } = handlers
   ```

4. **Using `auth()` in Server Components**:
   ```typescript
   import { auth } from "@/auth"
   
   export default async function Page() {
     const session = await auth()
     if (!session?.user) return <div>Not logged in</div>
     return <div>Welcome {session.user.name}</div>
   }
   ```

5. **Using `auth()` in Server Actions**:
   ```typescript
   "use server"
   import { auth } from "@/auth"

   export async function myAction() {
     const session = await auth()
     if (!session) throw new Error("Unauthorized")
     // ...
   }
   ```

6. **Middleware**:
   Use NextAuth inside `middleware.ts` for Edge protection.
   ```typescript
   import { auth } from "@/auth"
   export default auth((req) => {
     if (!req.auth && req.nextUrl.pathname.startsWith('/protected')) {
       const newUrl = new URL("/login", req.nextUrl.origin)
       return Response.redirect(newUrl)
     }
   })
   ```

7. **Do not use `getSession` on the server anymore.** Use `auth()`.
