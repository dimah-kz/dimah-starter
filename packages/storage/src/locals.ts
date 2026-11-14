declare module "@dimah-s3/server" {
  interface DimahS3Locals {
    /** Signed-in user, set by the instance guard. */
    userId?: string
    /** Active organization of the session, set by the instance guard. */
    organizationId?: string | null
  }
}

export {}
