# @repo/api

Product-domain [oRPC](https://orpc.dev) v2. Procedures live in `src/routers/<domain>/`. `src/router.ts` only composes those routers.

Web: `createRouterClient` with `createContext`. HTTP: `handleRequest` at `/api/rpc` (1 MiB body limit). Other clients: `createApiClient` from `@repo/api/client`.

Auth stays in `@repo/auth`; procedures do not wrap Better Auth. Test a procedure with `call` or `createRouterClient` from `@orpc/server` and a mocked `@repo/auth` — see `src/base.test.ts`. Guide: [docs/agents/api.md](../../docs/agents/api.md).
