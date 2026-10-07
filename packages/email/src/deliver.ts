import { Resend } from "resend"
import type { ReactElement } from "react"

export type SendEmailInput = {
  to: string
  subject: string
  react: ReactElement
  text: string
}

let client: Resend | undefined

function resendClient(apiKey: string) {
  client ??= new Resend(apiKey)
  return client
}

export async function send(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY and EMAIL_FROM are required")
    }

    console.info(
      `[email] To: ${input.to}\nSubject: ${input.subject}\n${input.text}`
    )
    return
  }

  const { error } = await resendClient(apiKey).emails.send({
    from,
    to: input.to,
    subject: input.subject,
    react: input.react,
    text: input.text,
  })

  if (error) {
    throw new Error(error.message)
  }
}
