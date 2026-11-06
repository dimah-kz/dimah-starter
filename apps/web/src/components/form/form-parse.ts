/** Trimmed text field; `""` when missing. */
export function getFormString(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

/** Password field as typed — leading and trailing spaces are part of it. */
export function getFormPassword(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}
