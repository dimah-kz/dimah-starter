import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { AuthCrossLink } from "@/app/(auth)/components/auth-cross-link"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"

/** Link (with an optional lead-in) under each form, as `auth.json` keys. */
const footers = {
  login: {
    target: authRoutes.signup(),
    prompt: "login.noAccount",
    link: "login.signUpLink",
  },
  signup: {
    target: authRoutes.login(),
    prompt: "signup.hasAccount",
    link: "signup.signInLink",
  },
  forgotPassword: {
    target: authRoutes.login(),
    link: "forgotPassword.backToSignIn",
  },
  verifyEmail: {
    target: authRoutes.login(),
    link: "verifyEmail.backToSignIn",
  },
} as const

type AuthFormSection = keyof typeof footers | "resetPassword"

type AuthFormLayoutProps = {
  /** `auth.json` section holding the page `title`. */
  section: AuthFormSection
  children: React.ReactNode
}

/** Title, page content, and footer link shared by the email/password layouts. */
export function AuthFormLayout({ section, children }: AuthFormLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <AuthFormTitle section={section} />
      </Suspense>
      {children}
      {section === "resetPassword" ? null : (
        <Suspense>
          <AuthFormFooter section={section} />
        </Suspense>
      )}
    </div>
  )
}

async function AuthFormTitle({ section }: { section: AuthFormSection }) {
  const t = await getTranslations("auth")

  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold">{t(`${section}.title`)}</h1>
    </div>
  )
}

async function AuthFormFooter({ section }: { section: keyof typeof footers }) {
  const t = await getTranslations("auth")
  const footer = footers[section]
  const link = (
    <AuthCrossLink className="font-medium text-primary" target={footer.target}>
      {t(footer.link)}
    </AuthCrossLink>
  )

  return (
    <div className="px-2 text-center text-sm">
      {"prompt" in footer ? (
        <p className="text-muted-foreground">
          {t(footer.prompt)} {link}
        </p>
      ) : (
        link
      )}
    </div>
  )
}
