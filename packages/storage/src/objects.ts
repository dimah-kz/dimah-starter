import { toPublicUrl } from "./keys"
import { toProfileScope, type ImageRoute } from "./routes"
import { s3 } from "./s3"

export type OwnedImageUrl =
  { url: string } | { error: "invalid" | "unconfigured" }

/**
 * Public URL for an active object in this scope.
 * `invalid` when the key is not that row. `unconfigured` when
 * `S3_PUBLIC_BASE_URL` is unset.
 */
export async function toOwnedImageUrl(input: {
  route: ImageRoute
  ownerId: string
  key: string
}): Promise<OwnedImageUrl> {
  const bucket = process.env.S3_BUCKET
  if (!bucket) return { error: "invalid" }
  const row = await s3.db.objects.find({ bucket, key: input.key })
  if (
    !row ||
    row.status !== "active" ||
    row.route !== input.route ||
    row.scope !== toProfileScope(input.route, input.ownerId)
  ) {
    return { error: "invalid" }
  }
  const url = toPublicUrl(row.key)
  if (!url) return { error: "unconfigured" }
  return { url }
}
