export type AuthFormState = {
  formError?: string
  formMessage?: string
  /**
   * Non-secret fields as submitted. React resets uncontrolled inputs after a
   * form action, so forms use these as `defaultValue`. Never passwords.
   */
  values?: { name?: string; email?: string }
}

export const AUTH_FORM_INITIAL_STATE: AuthFormState = {}
