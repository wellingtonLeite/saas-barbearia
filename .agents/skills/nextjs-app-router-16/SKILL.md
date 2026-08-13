---
name: nextjs-app-router-16
description: Guidelines and documentation for Next.js 16 (App Router). Use this skill when making architectural decisions, routing, data fetching, or handling server/client components.
---

# Next.js 16 App Router Best Practices

Next.js 16 continues the evolution of the App Router, placing heavy emphasis on Server Components, dynamic rendering, and caching controls.

## Core Concepts

1. **RSC First (React Server Components)**:
   - All components in the App Router (`app/`) are Server Components by default.
   - Use `"use client"` **only** when necessary (e.g., when you need `useState`, `useEffect`, event listeners like `onClick`, or browser APIs).
   - Push `"use client"` down the component tree as far as possible to maximize server rendering benefits.

2. **Data Fetching**:
   - `fetch` API is extended by Next.js to provide native caching and revalidation.
   - You can fetch data directly in Server Components without `useEffect`:
     ```tsx
     export default async function Page() {
       const data = await fetch('https://api.example.com/data', { cache: 'no-store' }).then(res => res.json())
       return <div>{data.title}</div>
     }
     ```

3. **Server Actions (Mutations)**:
   - Use Server Actions for all mutations (creating, updating, deleting data).
   - Place them in a separate file with `"use server"` at the top, or inline in a Server Component.
   - Always validate inputs on the server before interacting with the database.

4. **Dynamic vs. Static**:
   - Next.js tries to statically render pages at build time.
   - Using functions like `cookies()`, `headers()`, `searchParams` prop, or `unstable_noStore()` opts the page into dynamic rendering.
   - Starting from Next.js 15+, caching defaults have changed (e.g., fetch requests are no longer cached by default in some contexts). Always explicitly define caching strategies if necessary.

5. **Layouts and Templates**:
   - `layout.tsx` preserves state across navigation.
   - `template.tsx` creates a new instance (and resets state) on navigation.

6. **Routing & Structure**:
   - Use route groups `(group-name)` to organize files without affecting the URL path.
   - Use private folders `_folderName` for internal utility files or components that should not be routable.
