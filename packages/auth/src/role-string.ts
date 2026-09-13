/** Better Auth stores roles as a comma-separated string on user/member rows. */

export function parseRoleString(role: string | null | undefined): string[] {
  if (!role) {
    return []
  }

  return role
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
}
