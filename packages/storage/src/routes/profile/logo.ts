import { route, s3Error } from "@dimah-s3/server"
import { auth } from "@repo/auth"
import { imageObject, imageUpload } from "./image"

/**
 * The active organization's logo. Members can read it; uploading or deleting
 * needs `organization:update`, the same permission as saving the logo.
 */
export const logo = route({
  guard: async ({ request, locals, operation }) => {
    if (locals.system) return
    const organizationId = locals.organizationId
    if (!organizationId) throw s3Error("FORBIDDEN")
    if (operation === "download" || operation === "file") return
    const { success } = await auth.api.hasPermission({
      headers: request.headers,
      body: { organizationId, permissions: { organization: ["update"] } },
    })
    if (!success) throw s3Error("FORBIDDEN")
  },
  upload: {
    ...imageUpload,
    object: ({ locals }) => imageObject(locals.organizationId),
  },
  download: { disposition: "inline" },
  delete: true,
})
