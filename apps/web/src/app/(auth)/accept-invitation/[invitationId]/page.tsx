import { Suspense } from "react"
import Link from "next/link"
import { io } from "next/cache"
import { headers } from "next/headers"
import { AcceptInvitationForm } from "@/app/(auth)/accept-invitation/[invitationId]/components/accept-invitation-form"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { MembershipRoleBadge } from "@/components/badge/membership-role-badge"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { getTranslations } from "next-intl/server"

type AcceptInvitationPageProps = {
  params: Promise<{ invitationId: string }>
}

export default function AcceptInvitationPage(props: AcceptInvitationPageProps) {
  return (
    <Suspense>
      <AcceptInvitationContent {...props} />
    </Suspense>
  )
}

async function AcceptInvitationContent({ params }: AcceptInvitationPageProps) {
  const { invitationId } = await params
  const t = await getTranslations("auth.acceptInvitation")
  await io()
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>
      {session?.user ? (
        <SignedInInvitation
          invitationId={invitationId}
          requestHeaders={requestHeaders}
        />
      ) : (
        <SignedOutInvitation invitationId={invitationId} />
      )}
    </div>
  )
}

async function SignedOutInvitation({ invitationId }: { invitationId: string }) {
  const t = await getTranslations("auth.acceptInvitation")
  const redirect = authRoutes.acceptInvitation(invitationId)
  const query = new URLSearchParams({ redirect }).toString()

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">{t("signInRequired")}</p>
      <p className="text-sm">
        <Link
          className="font-medium text-primary"
          href={`${authRoutes.login()}?${query}`}
        >
          {t("signIn")}
        </Link>
        <span className="text-muted-foreground"> · </span>
        <Link
          className="font-medium text-primary"
          href={`${authRoutes.signup()}?${query}`}
        >
          {t("signUp")}
        </Link>
      </p>
    </div>
  )
}

async function SignedInInvitation({
  invitationId,
  requestHeaders,
}: {
  invitationId: string
  requestHeaders: Headers
}) {
  const t = await getTranslations("auth.acceptInvitation")
  let loadError: unknown
  let invitation: Awaited<ReturnType<typeof auth.api.getInvitation>> | undefined

  try {
    invitation = await auth.api.getInvitation({
      headers: requestHeaders,
      query: { id: invitationId },
    })
  } catch (error) {
    loadError = error
  }

  if (!invitation) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {getAuthApiErrorMessage(loadError) || t("unavailable")}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        {t("description", {
          inviter: invitation.inviterEmail,
          organization: invitation.organizationName,
        })}
      </p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">{t("role")}</span>
        <MembershipRoleBadge role={invitation.role ?? "member"} />
      </div>
      <AcceptInvitationForm invitationId={invitation.id} />
    </div>
  )
}
