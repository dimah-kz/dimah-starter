/**
 * The person closed the browser's passkey prompt, or it timed out. Not an
 * error worth showing: they chose not to go on.
 */
export function isPasskeyPromptDismissed(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "NotAllowedError" || error.name === "AbortError")
  )
}
