<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Custom Project Rules & Skill Triggers

You are working in a modern Next.js 16 environment. To ensure you use the most up-to-date syntax, **always** activate the relevant skills before making changes:

- **Authentication**: If you are working on login, session, or auth routes, you MUST load the `next-auth-v5` skill.
- **Styling**: If you are working with CSS or Tailwind classes, you MUST load the `tailwindcss-v4` skill.
- **Components & UI**: If you are working with React components, forms, or actions, you MUST load the `react-19` skill.
- **Shadcn UI**: If you are adding or modifying Shadcn UI components, you MUST load the `shadcn-ui` skill.
- **Architecture & Routing**: If you are creating pages, layouts, or fetching data, you MUST load the `nextjs-app-router-16` skill.
