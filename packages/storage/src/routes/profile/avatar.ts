import { route } from "@dimah-s3/server"
import { imageObject, imageUpload } from "./image"

/** The signed-in user's picture. */
export const avatar = route({
  upload: {
    ...imageUpload,
    object: ({ locals }) => imageObject(locals.userId),
  },
  download: { disposition: "inline" },
  delete: true,
})
