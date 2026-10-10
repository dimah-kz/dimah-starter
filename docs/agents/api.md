# Product API (`@repo/api`)

oRPC v2 for **product** domain only. Auth stays on `auth.api`. Live router: [`packages/api/src`](../../packages/api/src).

## Layout

`src/router.ts` only composes domains. A domain is a folder; a procedure is a file in that folder. Copy `routers/health/`.

```
src/
  base.ts                 pub, authed
  router.ts               { health, … }
  routers/<domain>/
    index.ts              { ping, … }
    <procedure>.ts
```

New procedure: add `<procedure>.ts` in that domain and export it from the domain `index.ts`. New domain: add a folder and one key on `router.ts`. Build from `pub` / `authed` in `base.ts`. Do not compose them in an app. Do not wrap Better Auth.

A helper used by one procedure stays in that file. Something shared by one domain stays in that folder. Do not import another domain's procedures.

| Builder  | When                                               |
| -------- | -------------------------------------------------- |
| `pub`    | No session (`health.ping`)                         |
| `authed` | Needs `context.session` from `auth.api.getSession` |

Permissions stay on `auth.api`.

| Caller                  | How                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| Web Server Action / RSC | `createRouterClient(router, { context: { headers: await headers() } })` — in-process              |
| Mobile / HTTP           | `createORPCClient({ origin })` from `@repo/api/client` — never import `@repo/api` (pulls auth/db) |
| `'use cache'`           | Do not call `headers()` inside the cache function. Pass ids, or query the db in the app           |

Web mutations stay in `app/action/<segment>/`. Next cache APIs never belong in `@repo/api`.

The only product HTTP surface is `apps/web/src/app/api/rpc/[[...rest]]/route.ts`. Do not export `GET` (cookie CSRF). Client components import `@repo/api/client` only.
