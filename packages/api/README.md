# @repo/api

Product-domain [oRPC](https://orpc.dev) v2. Procedures live in `src/routers/<domain>/`. `src/router.ts` only composes those routers.

Web: `createRouterClient`. HTTP: `handleRequest` at `/api/rpc`. Other clients: `createORPCClient` from `@repo/api/client`.

Auth stays in `@repo/auth`. Do not wrap Better Auth.
