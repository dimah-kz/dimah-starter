import { dashboardAuthHeaders } from "@/app/dashboard/lib/dashboard-session"
import { auth } from "@repo/auth"

/** Role of the signed-in user in the active organization (for manage UI hints). */
export async function getActorOrganizationRole() {
  try {
    const result = await auth.api.getActiveMemberRole({
      headers: await dashboardAuthHeaders(),
    })
    return result.role ?? null
  } catch {
    return null
  }
}
