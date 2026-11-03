import { S3Client } from "@aws-sdk/client-s3"
import { db } from "@dimah-s3/db"
import { dimahS3, s3Error } from "@dimah-s3/server"
import { auth } from "@repo/auth"
import { dimahS3Db } from "@repo/db/dimah-s3"
import "./locals"
import { routes, toCallerScope } from "./routes"

export const awsS3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
})

export const s3 = dimahS3({
  client: awsS3,
  bucket: process.env.S3_BUCKET!,
  guard: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw s3Error("UNAUTHORIZED")
    return {
      locals: {
        userId: session.user.id,
        activeOrganizationId: session.session.activeOrganizationId,
        userImage: session.user.image,
      },
    }
  },
  plugins: [
    db({
      client: dimahS3Db,
      getSession: (request) =>
        auth.api.getSession({ headers: request.headers }),
      resolveScope: ({ session, route }) => toCallerScope(session, route),
    }),
  ],
  routes,
})
