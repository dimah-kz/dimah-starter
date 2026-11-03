# @repo/storage

[dimah-s3](https://v2.s3.dimah.dev) 2.0 beta. `s3.ts` wires the client, the session guard, and the database plugin. Routes are grouped like `@repo/api`: one folder per group, one file per route.

`routes/profile/` is the signed-in user and the active organization:

- `avatar.ts` — `user:{id}`
- `logo.ts` — `org:{id}`

`@dimah-s3/db` tracks each object (schema 2.1.0, PostgreSQL schema `storage`). A new upload passes `previousKey` so the package deletes the previous object.

To add a route, add `routes/<group>/<name>.ts`, spread the group from `routes/index.ts`, and name it on `DimahS3Routes` in `s3-client.tsx`.

Needs `DIMAH_S3_SECRET` (at least 32 characters) and the `S3_*` variables from `.env.example`.
