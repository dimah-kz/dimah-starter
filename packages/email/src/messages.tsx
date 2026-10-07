import type { Locale } from "@repo/i18n"
import {
  appName,
  emailMessages,
  fill,
  formatEmailDate,
  membershipRoleLabel,
} from "./copy"
import { send } from "./deliver"
import { TransactionalEmail } from "./transactional-email"

type ActionEmailInput = {
  to: string
  url: string
  locale: Locale
}

function actionMail(
  input: ActionEmailInput & {
    subject: string
    preview: string
    heading: string
    paragraphs: string[]
    actionLabel: string
    footer: string
    fallback: string
  }
) {
  const text = [
    ...input.paragraphs,
    input.actionLabel,
    input.url,
    input.footer,
  ].join("\n\n")

  return send({
    to: input.to,
    subject: input.subject,
    text,
    react: (
      <TransactionalEmail
        locale={input.locale}
        preview={input.preview}
        heading={input.heading}
        paragraphs={input.paragraphs}
        actionLabel={input.actionLabel}
        actionUrl={input.url}
        fallback={input.fallback}
        footer={input.footer}
      />
    ),
  })
}

export function sendVerification({ to, url, locale }: ActionEmailInput) {
  const copy = emailMessages(locale).verify
  const values = { app: appName(locale), email: to }

  return actionMail({
    to,
    url,
    locale,
    subject: fill(copy.subject, values),
    preview: fill(copy.preview, values),
    heading: fill(copy.heading, values),
    paragraphs: [fill(copy.body, values)],
    actionLabel: copy.action,
    footer: fill(copy.footer, values),
    fallback: emailMessages(locale).layout.fallback,
  })
}

export function sendPasswordReset({ to, url, locale }: ActionEmailInput) {
  const copy = emailMessages(locale).reset
  const values = { app: appName(locale), email: to }

  return actionMail({
    to,
    url,
    locale,
    subject: fill(copy.subject, values),
    preview: fill(copy.preview, values),
    heading: fill(copy.heading, values),
    paragraphs: [fill(copy.body, values)],
    actionLabel: copy.action,
    footer: fill(copy.footer, values),
    fallback: emailMessages(locale).layout.fallback,
  })
}

export function sendSignUpAttempt({ to, url, locale }: ActionEmailInput) {
  const copy = emailMessages(locale).signUpAttempt
  const values = { app: appName(locale), email: to }

  return actionMail({
    to,
    url,
    locale,
    subject: fill(copy.subject, values),
    preview: fill(copy.preview, values),
    heading: fill(copy.heading, values),
    paragraphs: [fill(copy.body, values)],
    actionLabel: copy.action,
    footer: fill(copy.footer, values),
    fallback: emailMessages(locale).layout.fallback,
  })
}

export function sendOrganizationInvitation({
  to,
  url,
  locale,
  organizationName,
  inviterName,
  role,
  expiresAt,
}: ActionEmailInput & {
  organizationName: string
  inviterName: string
  role: string
  expiresAt: Date | string
}) {
  const copy = emailMessages(locale).invitation
  const values = {
    app: appName(locale),
    email: to,
    organization: organizationName,
    inviter: inviterName,
    role: membershipRoleLabel(locale, role),
    expires: formatEmailDate(expiresAt, locale),
  }

  return actionMail({
    to,
    url,
    locale,
    subject: fill(copy.subject, values),
    preview: fill(copy.preview, values),
    heading: fill(copy.heading, values),
    paragraphs: [fill(copy.body, values), fill(copy.expires, values)],
    actionLabel: copy.action,
    footer: fill(copy.footer, values),
    fallback: emailMessages(locale).layout.fallback,
  })
}
