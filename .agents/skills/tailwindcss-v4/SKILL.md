---
name: tailwindcss-v4
description: Guidelines and documentation for Tailwind CSS v4. Use this skill when modifying styles, configuring themes, or adding CSS variables in a Tailwind v4 environment.
---

# Tailwind CSS v4 Best Practices

Tailwind v4 is a complete rewrite emphasizing performance and a CSS-first configuration approach.

## Core Concepts

1. **No `tailwind.config.js` by default**:
   - Configuration is now primarily done via CSS variables in your main CSS file (e.g., `globals.css`).
   - The `@tailwind` directives are replaced by a single `@import "tailwindcss";`.

2. **CSS Configuration**:
   ```css
   @import "tailwindcss";

   @theme {
     --color-primary-500: #0ea5e9;
     --font-display: "Oswald", "sans-serif";
   }
   ```
   Variables defined inside `@theme` automatically generate utility classes like `text-primary-500` or `font-display`.

3. **Using `@tailwindcss/postcss`**:
   - The PostCSS plugin is now `@tailwindcss/postcss` instead of `tailwindcss`.
   - Your `postcss.config.mjs` should look like this:
     ```javascript
     export default {
       plugins: {
         "@tailwindcss/postcss": {},
       },
     };
     ```

4. **Dynamic Utilities & Arbitrary Values**:
   - Arbitrary values still work exactly the same: `w-[15px]`, `bg-[#1da1f2]`.
   - You don't need to manually define all screens in JS, you can use `@custom-media` or CSS vars for breakpoints.

5. **Legacy Config Compatibility**:
   - If a `tailwind.config.ts` is still present, Tailwind v4 can load it via `@config "./tailwind.config.ts"`, but migrating to pure CSS is highly recommended for performance and standard alignment.
