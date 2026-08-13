---
name: shadcn-ui
description: Guidelines and documentation for using Shadcn UI. Use this skill when requested to add new UI components, dialogs, buttons, or modify existing shadcn components.
---

# Shadcn UI Best Practices

Shadcn UI is not a traditional dependency package. Components are copied directly into the project (usually in `components/ui/`), allowing full control over the code.

## Core Concepts

1. **Adding Components**:
   - Always add components using the CLI to ensure dependencies (like Radix UI primitives) and the component code itself are properly injected.
   - Run: `npx shadcn@latest add [component-name]`
   - Example: `npx shadcn@latest add button card dialog`

2. **Component Customization**:
   - The generated components inside `components/ui/` use `tailwind-merge` and `clsx` (often wrapped in a `cn()` utility) to allow passing custom `className` props.
   - Example utility usage: 
     ```tsx
     import { cn } from "@/lib/utils"
     
     export function MyComponent({ className }: { className?: string }) {
       return <div className={cn("base-styles", className)}>...</div>
     }
     ```

3. **Variants**:
   - Shadcn components typically use `class-variance-authority` (cva) for defining style variants.
   - You can easily modify the CVA definitions inside a component's file to add your own variants or change default styles.

4. **Icons**:
   - Shadcn uses `lucide-react` by default. Always prefer `lucide-react` for iconography to maintain a consistent style.

5. **Tailwind v4 Compatibility**:
   - Since Shadcn UI relies heavily on CSS variables for theming, ensure that these variables are properly mapped in the Tailwind v4 `@theme` block or globals CSS if any visual bugs occur post-migration.
