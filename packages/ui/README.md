# @repo/ui

Shared [shadcn/ui](https://ui.shadcn.com/) primitives (Base UI under the hood), [ReUI](https://reui.io) components under `components/reui/`, first-party Dimah components under `components/dimah/`, and global styles for every app.

**Do not hand-edit** generated shadcn/ReUI components for durable changes. Use the sync scripts. Dimah files are authored here — edit them in place.

```bash
# From repo root — runs shadcn sync, then ReUI sync (+ patches), then prettier on packages/ui:
pnpm ui:sync

# Individually:
pnpm --filter @repo/ui sync:shadcn
pnpm --filter @repo/ui sync:reui
pnpm --filter @repo/ui sync:reui:patches

# Add a single primitive:
pnpm dlx shadcn@latest add button -c packages/ui

# Add a ReUI item, then register it in scripts/reui/components.mjs:
pnpm dlx shadcn@latest add @reui/<name> -c packages/ui
```

**ReUI patches.** A durable change to a ReUI file is a patch in `scripts/reui/patches/index.mjs`: an entry `{ id, file, apply }` in `patches`, where `apply(source)` returns `{ status: "applied" | "already-applied", source }`. `sync:reui` re-applies every patch after it overwrites the files and reports those files as overrides; `sync:reui:patches` applies them alone. The list is empty today.

Import from `@repo/ui/components/…` (also `components/reui/…` and `components/dimah/…`), `@repo/ui/hooks/…`, `@repo/ui/lib/…`, or `@repo/ui/globals.css`. `globals.css` scans `apps/**` and this package for Tailwind classes; a package that starts rendering classes needs its own `@source` line there. App-specific chrome and feature UI stay in each app, not here.
