# Product API (`@repo/api`)

Read when you add or change product data operations — the domain of your SaaS, not auth.

oRPC 2 beta. Auth, users, organizations and roles stay on `auth.api` ([better-auth.md](./better-auth.md)); procedures do not wrap Better Auth.

## Layout

```
packages/api/src/
  base.ts                 pub, authed, createContext
  router.ts               { health, … } — composes domains only
  routers/<domain>/
    index.ts              { ping, … }
    <procedure>.ts        one procedure per file
    <procedure>.test.ts
```

- **New procedure:** add `<procedure>.ts` and export it from the domain's `index.ts`.
- **New domain:** add a folder and one key in `router.ts`.
- **Where helpers go:** a helper used by one procedure stays in its file, and one shared by a domain stays in its folder. A domain never imports another domain's procedures.

Reference: `routers/health/ping.ts` and `ping.test.ts`.

| Builder  | Use                                                                       |
| -------- | ------------------------------------------------------------------------- |
| `pub`    | Session optional. Call `await context.getSession()` only when you need it |
| `authed` | Requires a session (`context.session`); throws `UNAUTHORIZED` without one |

Validate input and output with Zod (`.input(z.object(…))`, `.output(…)`). Check product permissions inside the procedure. For organization-level rights, `auth.api.hasPermission({ headers: context.headers, body })` covers it.

## Calling it

| Caller            | How                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Server Action     | `createRouterClient(router, { context: createContext(await headers()) })`, in-process                         |
| Server Component  | The same, with `createContext(await dashboardAuthHeaders())` so the session's clock read happens after `io()` |
| Another app, HTTP | `createApiClient({ origin })` from `@repo/api/client`                                                         |

- **Reuse one context per request.** `createContext(headers)` memoizes the session on that object. Use the same object for every call, and for the action's own session read (`await context.getSession()`), so the session is looked up once.
- **Don't call the router inside `'use cache'`.** It needs the request. Pass ids into a cached read in the app instead.
- **Keep Next.js out of the package.** `updateTag` and friends belong in the calling action, not in `@repo/api`.

## HTTP surface

- **Endpoint:** `apps/web/src/app/api/rpc/[[...rest]]/route.ts` mounts `handleRequest` at `/api/rpc`.
- **Methods:** it accepts `POST`, `PUT`, `PATCH` and `DELETE`. `GET` stays off because a cookie-authenticated `GET` is open to cross-site requests.
- **Body size:** bodies over 1 MiB get `PAYLOAD_TOO_LARGE`. Files go through `@repo/storage`, not the API.
- **Clients:** client components import `@repo/api/client` only. The package root pulls in auth and the database.
