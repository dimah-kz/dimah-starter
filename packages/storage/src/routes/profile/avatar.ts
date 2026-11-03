import { route, s3Error } from "@dimah-s3/server"
import "../../locals"
import { imageObject, imageUpload } from "./image"

/** One image per signed-in user. A new upload replaces the previous object. */
export const avatar = route({
  upload: {
    ...imageUpload,
    object: ({ locals }) => {
      const userId = locals.userId
      if (!userId) throw s3Error("UNAUTHORIZED")
      return imageObject("avatar", userId, locals.userImage)
    },
  },
  download: { disposition: "inline" },
  delete: true,
})

export function toAvatarScope(ownerId: string) {
  return `user:${ownerId}`
}
