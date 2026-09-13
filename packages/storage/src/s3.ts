import { S3Client } from "@aws-sdk/client-s3"
import { db } from "@dimah-s3/db"
import { dimahS3, errors, route } from "@dimah-s3/server"
import { auth } from "@repo/auth"
import { dimahS3Db } from "@repo/db/dimah-s3"
import { toOwnerScope } from "./owner"
import { resolveOwner } from "./owner/resolve"

export const awsS3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})

export const s3 = dimahS3({
  client: awsS3,
  bucket: process.env.S3_BUCKET!,
  guard: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw errors.unauthorized()
  },
  plugins: [
    db({
      client: dimahS3Db,
      resolveScope: async (request) => {
        const owner = await resolveOwner(request)
        return owner ? toOwnerScope(owner) : null
      },
    }),
  ],
  routes: {
    avatars: route({
      upload: {
        replace: "overwrite",
        fileTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        maxFileSize: 2 * 1024 * 1024,
        object: async ({ request }) => {
          const owner = await resolveOwner(request)
          if (!owner) throw errors.forbidden()
          return { key: `${owner.kind}/${owner.id}` }
        },
      },
      delete: true,
    }),
  },
})
