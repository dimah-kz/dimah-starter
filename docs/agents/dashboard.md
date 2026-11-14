# Dashboard

Read when you add or change a page under `apps/web/src/app/dashboard/`, its sidebar entry, or a server-rendered list.

## Single sources of truth

| What                       | Where (`apps/web/src/app/dashboard/…`)                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| URLs                       | `lib/dashboard-routes.ts` (`dashboardRoutes`, `dashboardRouteSegments`)                                    |
| Breadcrumb labels          | `dashboardRouteSegments` + `dashboard.breadcrumbSegments` in `packages/i18n/src/messages/*/dashboard.json` |
| Cache tags                 | `lib/cache-tags.ts`                                                                                        |
| Gates                      | `lib/dashboard-session.ts`                                                                                 |
| Admin / manage nav entries | `admin/lib/admin-slices.ts`, `(organization)/manage/lib/organization-manage-tabs.ts`                       |
| Sidebar sections           | `lib/sidebar-nav-sections.ts`, built from the two registries above                                         |
| Copy                       | `packages/i18n/src/messages/*/dashboard.json`, `tables.json`, `account.json`                               |

The sidebar is the only navigation for the admin and manage areas: a page shows its own content, without a repeated tab bar or section title.

## Add a page

Copy the closest sibling: `admin/users/` for a platform-admin list, `(organization)/manage/members/` for an organization list, `account/` for the signed-in user's own settings.

1. **Route:** add the folder, then its URL in `dashboard-routes.ts` and its breadcrumb label in both locales.
2. **Nav:** for an admin or manage page, add an entry with `icon`, `labelKey` and `href` to its registry.
3. **Gate the page and its data.** `page.tsx` calls `requirePlatformAdmin()`, `requireOrganizationManager()` or `requireDashboardSession()`, inside `<Suspense>`. Its `get-*.ts` calls the same gate before the cached read. The layout gate only redirects; it does not keep the page's data out of the response.
4. **Read:** `lib/get-*.ts` gates, then calls a `'use cache'` function tagged from `cache-tags.ts` — [nextjs.md](./nextjs.md#cached-reads).
5. **Write:** one action per mutation in `apps/web/src/app/action/dashboard/<same path>/` — [better-auth.md § Writes](./better-auth.md#writes).

To remove an area, delete its route folder, its `action/dashboard/…` folder and its keys in the routes, tags, registries and messages.

## Server-rendered lists

The list's state lives in the URL (`page`, `pageSize`, `filter`, `q`). The page renders one page of rows from the database on the server. No client table library is involved.

Reference: `(organization)/manage/members/` — `lib/members-table-params.ts`, `lib/get-organization-members-page.ts`, `components/members-columns.tsx`, `components/members-table.tsx`, `page.tsx`.

| File                | Does                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*-table-params.ts` | Default page size, the `*_TABLE_FILTERS` tuple (filter type and `Select` options), `parse*PageQuery(searchParams)`, the path builder over `listPath`    |
| `get-*-page.ts`     | Gate, then the tagged cached query. Search with `toListSearchPattern(q)` (escaped `ILIKE`, minimum length); keep the page in range with `clampListPage` |
| `*-columns.tsx`     | `ListColumn<T>[]`. The identity column is `w-full min-w-0`, compact columns get a `min-w-*`, and the trailing actions column has `id: "actions"`        |
| `*-table.tsx`       | Card with `ListSearch`, a `Select` filter calling `list.setFilter`, `ListTable` and `ListPagination`, wired through `useList`                           |
| `page.tsx`          | Parses `searchParams`, runs the gate and the read in parallel, passes the page in; `ListSkeleton` is the fallback                                       |

The list helpers come from `apps/web/src/components/list` (`index.ts`).

- Every column shows at every breakpoint; the table scrolls sideways.
- Give the table a `caption` and a `countLabel`, and set `busy={list.isPending}`.
- When nothing matches the filters, show `tables.empty.results`; when there are no rows at all, show `tables.empty.<noun>`.
