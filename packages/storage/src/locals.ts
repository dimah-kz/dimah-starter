declare module "@dimah-s3/server" {
  interface DimahS3Locals {
    /** Signed-in user, set by the instance guard. */
    userId?: string
    /** Active organization of the session, set by the instance guard. */
    organizationId?: string | null
    /**
     * Server code already checked access, such as cleanup after an owner is
     * deleted. Only in-process calls can set it: HTTP requests never carry
     * `locals`.
     */
    system?: boolean
  }
}

export {}
