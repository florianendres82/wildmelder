# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

There are no tests configured yet.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase · shadcn/ui

**Key directories:**
- `app/` — App Router routes. Each folder is a route segment; `layout.tsx` wraps children, `page.tsx` is the leaf UI.
- `components/ui/` — shadcn/ui components. Add new ones with `npx shadcn@latest add <component>`.
- `lib/utils.ts` — `cn()` helper for merging Tailwind classes (clsx + tailwind-merge).

**Path alias:** `@/*` resolves to the project root.

## Critical API differences from older Next.js

`params` and `searchParams` props in `page.tsx` and `layout.tsx` are now **Promises** and must be awaited:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
}
```

Before writing any route or layout code, read the relevant guide in `node_modules/next/dist/docs/`.

## Supabase

The project uses `@supabase/supabase-js` and `@supabase/ssr`. Use the SSR package for server-side data fetching in Server Components and Route Handlers to correctly handle cookies/auth.

## Styling

Tailwind CSS 4 is configured via PostCSS (`@tailwindcss/postcss`). Theme tokens (colors, radius, etc.) are defined as CSS custom properties in `app/globals.css` using OKLCH color space and bound to Tailwind via `@theme inline`. Dark mode is supported via the same CSS variable system.
