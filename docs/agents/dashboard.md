# Dashboard

> Rule: `.cursor/rules/dashboard.mdc`

Dashboard UI lives in the app, not in core packages. Mirror a sibling under `apps/web/src/app/dashboard/`.

## SSOT

| What           | Where                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| URLs           | `dashboard/lib/dashboard-routes.ts`                                       |
| Breadcrumbs    | `dashboardRouteSegments` + `dashboard.breadcrumbSegments` in i18n         |
| Nav / tab copy | `@repo/i18n` `dashboard.json`                                             |
| Cache tags     | `dashboard/lib/cache-tags.ts`                                             |
| Tab registry   | `*-slices.ts` / `*-tabs.ts` beside that area (`icon`, `labelKey`, `href`) |

No hardcoded paths or chrome strings.

Sidebar drill-down for admin/manage comes from those registries in `sidebar-nav-sections.ts`. Do not repeat that nav, or a section title such as organization management, on the page.

## New feature

1. Route under `dashboard/…` — copy a sibling.
2. Register URL, labels, tags.
3. Lists: `get-*.ts` + `'use cache'` + tags.
4. Writes: `app/action/dashboard/…` → `auth.api`.
5. Optional UI gate: `hasPermission` / `userHasPermission`.
6. Lists: copy the members table — [architecture.md § Placement](./architecture.md#placement).

Remove a slice by deleting the route tree, matching `action/dashboard/…`, and unused SSOT keys.

## Server lists {#server-lists}

Canonical: `…/members/components/members-table.tsx` (+ `members-columns.tsx`, page `get-*.ts`, `*-table-params.ts`).

| Layer               | Owns                                    |
| ------------------- | --------------------------------------- |
| `list/` URL         | `page` / `pageSize` / `filter` / `q`    |
| `ListTable`         | thead / tbody / empty                   |
| Feature `*-columns` | `ListColumn<T>[]`                       |
| shadcn `Select`     | Enum filter → `list.setFilter` (inline) |

1. `get-*.ts` — tagged page from the db. Use `LIST_SEARCH_MIN_LENGTH` for `q`.
2. `*-table-params.ts` — `listPath` + parse helpers.
3. `*-columns.tsx` — identity `w-full min-w-0`; compact `min-w-*`; trailing actions `id: "actions"`.
4. `*-table.tsx` — Card + `ListSearch` + `Select` + `ListTable` + `ListPagination`.
5. `page.tsx` — parse search params, fetch, pass the page in. Fallback: `ListSkeleton`.

Show every column at every breakpoint (horizontal scroll). `caption`, `countLabel`, `busy={list.isPending}`. Empty: `tables.empty.results` when filtered; otherwise `tables.empty.<noun>`.

Do not use TanStack Table or ReUI DataGrid for these URL/RSC lists. Do not invent `ListDataGrid` / `ListFilter` wrappers.
