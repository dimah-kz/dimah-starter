import { siteLinks } from "@/lib/site"
import { appOrigin } from "@repo/auth/app-origin"
import { loadMessages } from "@repo/i18n"

/**
 * `/llms.txt` (llmstxt.org): a Markdown map of the project for AI assistants
 * and answer engines. Static — prerendered at build. Replace it with your
 * product's own summary when you rebrand the landing page.
 */
export function GET() {
  const { common } = loadMessages("en")
  const doc = (path: string) => `${siteLinks.raw}/${path}`

  const body = `# ${common.appTitle}

> ${common.appDescription}

Use it as a GitHub template (${siteLinks.template}). Everything runs on the server: pages read the Better Auth session in Server Components, lists come from tagged \`'use cache'\` reads, and every write is a Server Action that calls \`auth.api\` or the oRPC router. Built on Next.js 16 Cache Components and Partial Prefetching: reads are tagged cache entries, links prefetch each route's static shell, and actions expire exactly the tags they change with \`updateTag\`. Stack: Next.js 16, React 19, TypeScript, Better Auth, Drizzle ORM, PostgreSQL, oRPC, Tailwind CSS 4, shadcn/ui, next-intl, Turborepo, pnpm. License: MIT.

## Docs

- [README](${doc("README.md")}): features, architecture, quick start, production checklist, FAQ
- [AGENTS.md](${doc("AGENTS.md")}): rules for AI coding agents working in the repo
- [Architecture](${doc("docs/agents/architecture.md")}): where code belongs, single sources of truth, naming
- [Dashboard](${doc("docs/agents/dashboard.md")}): adding dashboard pages, permission gates, server lists
- [Better Auth](${doc("docs/agents/better-auth.md")}): auth config, permissions, rate limits, sessions
- [Caching](${doc("docs/agents/caching.md")}): tagged reads and invalidation after writes
- [Product API](${doc("docs/agents/api.md")}): oRPC procedures in \`@repo/api\`
- [i18n](${doc("docs/agents/i18n.md")}): messages, locales, right-to-left

## Optional

- [Live demo](${appOrigin()}/): sign up to explore the dashboard
- [Source code](${siteLinks.github})
- [Contributing](${doc("CONTRIBUTING.md")})
`

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
