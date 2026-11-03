declare module "@dimah-s3/server" {
  interface DimahS3Locals {
    userId?: string
    activeOrganizationId?: string | null
    userImage?: string | null
  }
}

export {}
