import { render } from "@react-email/components"
import { getLocaleDirection, locales } from "@repo/i18n"
import { describe, expect, it, vi } from "vitest"
import { send } from "./deliver"
import { sendAuthMail, sendOrganizationInvitation } from "./messages"

vi.mock("./deliver", () => ({ send: vi.fn() }))

const url = "https://app.example.com/verify?token=abc"
const unfilledPlaceholder = /\{\w+\}/

/** What `send` received last, with the React template rendered to HTML. */
async function sentMail() {
  const [input] = vi.mocked(send).mock.lastCall!
  return { ...input, html: await render(input.react) }
}

describe.each(locales)("%s", (locale) => {
  it.each(["verify", "reset", "signUpAttempt"] as const)(
    "%s mail carries the link in the locale's direction",
    async (kind) => {
      await sendAuthMail(kind, { to: "ada@example.com", url, locale })
      const mail = await sentMail()

      expect(mail.to).toBe("ada@example.com")
      expect(mail.subject).toBeTruthy()
      expect(`${mail.subject}\n${mail.text}`).not.toMatch(unfilledPlaceholder)
      expect(mail.text).toContain(url)
      expect(mail.html).toContain(`href="${url}"`)
      expect(mail.html).toContain(`dir="${getLocaleDirection(locale)}"`)
    }
  )

  it("invitation names the organization and the inviter", async () => {
    await sendOrganizationInvitation({
      to: "ada@example.com",
      url,
      locale,
      organizationName: "Acme",
      inviterName: "Grace",
      role: "admin,member",
      expiresAt: new Date("2030-01-01T00:00:00Z"),
    })
    const mail = await sentMail()

    expect(`${mail.subject}\n${mail.text}`).not.toMatch(unfilledPlaceholder)
    expect(mail.text).toContain("Acme")
    expect(mail.text).toContain("Grace")
    expect(mail.html).toContain(`href="${url}"`)
  })
})
