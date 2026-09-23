# UI

> Rule: `.cursor/rules/ui-design.mdc`

`@repo/ui` holds shadcn / Base UI primitives. App-composed components stay in each app.

- `lang` / `dir` on root layout only
- Logical Tailwind (`ms` / `me`, `start` / `end`)
- `cn` from the `cn` package (`import { cn } from "cn"`). No local `lib/utils`.
- shadcn + ReUI: **never hand-edit** for durable fixes — `pnpm ui:sync`. Durable ReUI overrides: `packages/ui/scripts/reui/patches/`
- Dimah (`components/dimah/`): edit in place
- Link-as-button: `render={<Link … />}` + `nativeButton={false}`
- Product copy: `@repo/i18n` — [i18n.md](./i18n.md)

Prefer component `variant` / `size` over `className`. Add classes only when that call site needs them. Do not re-state radius/padding the primitive already sets.

`@shadcn/lint` enforces that in ESLint (`tooling/eslint-config/design-system.js`). `pnpm lint` runs it. Call sites may use layout classes. Padding, shape, color, and raw or arbitrary values on a primitive are errors. Inside `packages/ui/src/components`, appearance rules are off because those files own the styles; token and unknown-class rules stay on. ReUI stays ignored. `chart.tsx` is exempt from inline-style checks because series colors are injected there.

Existing app violations are baselined in `apps/web/eslint-suppressions.json`. A new violation fails lint. Do not raise a suppression count to land a restyle. After fixing one, prune it with `pnpm --filter web exec eslint . --prune-suppressions`.

```bash
pnpm ui:sync
pnpm dlx shadcn@latest add button -c packages/ui
pnpm dlx shadcn@latest add @reui/icon-tile -c packages/ui
```

After a new `@reui/…` item, append it to `packages/ui/scripts/reui/components.mjs`.

Client components must not import `@repo/auth`.
