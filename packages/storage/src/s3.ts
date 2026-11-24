import { S3Client } from "@aws-sdk/client-s3"
import { db } from "@dimah-s3/db"
import { dimahS3 } from "@dimah-s3/server"
import { db as drizzleDb } from "@repo/db"
import { storageDbClient } from "./db-client"
import { routes, toRouteOwner } from "./routes"
import { isAllowedDbOperation, toCallerScope } from "./scope"
import { sessionGuard } from "./session-guard"

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
  guard: (context) => {
    if (!configuredBucket) throw new Error("[storage] S3_BUCKET is not set")
    return sessionGuard(context)
  },
  plugins: [
    db({
      client: storageDbClient(drizzleDb),
      resolveScope: ({ locals, route }) =>
        toCallerScope(toRouteOwner(route), locals),
      authorize: ({ operation }) => isAllowedDbOperation(operation),
      quota: scopeQuota,
    }),
  ],
  routes,
})
