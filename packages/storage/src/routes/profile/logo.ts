import { route, s3Error } from "@dimah-s3/server"
import { auth } from "@repo/auth"
import "../../locals"
import { imageObject, imageUpload } from "./image"

/** One image for the active organization. */
export const logo = route({
  guard: ({ locals }) => {
    if (!locals.activeOrganizationId) throw s3Error("FORBIDDEN")
  },
  upload: {
    ...imageUpload,
    object: async ({ request, locals }) => {
      const organizationId = locals.activeOrganizationId
      if (!organizationId) throw s3Error("FORBIDDEN")
      const organization = await auth.api.getFullOrganization({
        headers: request.headers,
        query: { organizationId },
      })
      return imageObject("logo", organizationId, organization?.logo)
    },
  },
  download: { disposition: "inline" },
  delete: true,
})

export function toLogoScope(ownerId: string) {
  return `org:${ownerId}`
}
