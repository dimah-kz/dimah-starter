import { S3Client } from "@aws-sdk/client-s3"
import { DimahS3DB, db } from "@dimah-s3/db"
import { drizzleAdapter } from "@dimah-s3/db/adapters/drizzle"
import { dimahS3, s3Error } from "@dimah-s3/server"
import { auth } from "@repo/auth"
import { db as drizzleDb } from "@repo/db"
import "./locals"
import { routes, toRouteOwner } from "./routes"
import { toCallerScope } from "./scope"

const configuredBucket = process.env.S3_BUCKET?.trim()

/**
 * Bucket every route writes to. `dimahS3()` throws at import on an empty
 * bucket, so a placeholder keeps this package importable without `S3_*`
 * (pages only need `fromPublicUrl`); the guard fails every call instead.
 */
export const bucket = configuredBucket || "unconfigured"

// A scope owns one avatar or logo; the rest covers uploads awaiting cleanup.
const scopeQuota = { maxFiles: 10, maxBytes: 20 * 1024 * 1024 }

export const s3 = dimahS3({
  client: new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  }),
  bucket,
  // Reads the session once per call. Route guards and `resolveScope` use `locals`.
  guard: async ({ request, locals }) => {
    if (!configuredBucket) throw new Error("[storage] S3_BUCKET is not set")
    if (locals.system) return
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw s3Error("UNAUTHORIZED")
    return {
      locals: {
        userId: session.user.id,
        organizationId: session.session.activeOrganizationId,
      },
    }
  },
  plugins: [
    db({
      client: DimahS3DB.client(
        drizzleAdapter({ db: drizzleDb, provider: "postgresql" })
      ),
      resolveScope: ({ locals, route }) =>
        toCallerScope(toRouteOwner(route), locals),
      // Refuses `PATCH /db/object` and the folder endpoints: nothing uses them.
      authorize: ({ operation }) => operation !== "update",
      quota: scopeQuota,
    }),
  ],
  routes,
})
