import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { Locale } from "@repo/i18n"
import { emailDirection } from "./copy"

const bodyStyle = {
  backgroundColor: "#f4f4f5",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  margin: "0",
  padding: "24px 0",
}

const containerStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "32px",
}

const headingStyle = {
  color: "#18181b",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "28px",
  margin: "0 0 12px",
}

const textStyle = {
  color: "#3f3f46",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 12px",
}

const buttonStyle = {
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  lineHeight: "20px",
  padding: "12px 20px",
  textDecoration: "none",
}

const mutedStyle = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "16px 0 4px",
}

const linkStyle = {
  color: "#18181b",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
  wordBreak: "break-all" as const,
}

const ruleStyle = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
}

const footerStyle = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
}

export type TransactionalEmailProps = {
  locale: Locale
  preview: string
  heading: string
  paragraphs: string[]
  actionLabel: string
  actionUrl: string
  fallback: string
  footer: string
}

export function TransactionalEmail({
  locale,
  preview,
  heading,
  paragraphs,
  actionLabel,
  actionUrl,
  fallback,
  footer,
}: TransactionalEmailProps) {
  const direction = emailDirection(locale)

  return (
    <Html lang={locale} dir={direction}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ ...bodyStyle, direction }}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>{heading}</Heading>
          {paragraphs.map((paragraph) => (
            <Text key={paragraph} style={textStyle}>
              {paragraph}
            </Text>
          ))}
          <Section style={{ margin: "20px 0" }}>
            <Button href={actionUrl} style={buttonStyle}>
              {actionLabel}
            </Button>
          </Section>
          <Text style={mutedStyle}>{fallback}</Text>
          <Text style={linkStyle}>{actionUrl}</Text>
          <Hr style={ruleStyle} />
          <Text style={footerStyle}>{footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}
