import { ImageResponse } from "next/og"
import { brandMarkPath } from "@/components/brand-mark"
import { appOrigin } from "@repo/auth/app-origin"
import { defaultLocale, loadMessages } from "@repo/i18n"

/** Share image for every route. Crawlers send no locale cookie, so it uses the default locale. */
const { common, marketing } = loadMessages(defaultLocale)

export const alt = marketing.home.metaTitle
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const stack = ["Next.js", "Better Auth", "Postgres", "i18n + RTL"]

export default function OpengraphImage() {
  const headline = marketing.home.headline.replace(/<\/?accent>/g, "")

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        color: "#fafafa",
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(255, 30, 86, 0.2), transparent 40%), radial-gradient(circle at 100% 100%, rgba(1, 150, 255, 0.2), transparent 45%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg viewBox="0 0 16.3 20.3" width={36} height={45} fill="#fafafa">
          <path fillRule="evenodd" d={brandMarkPath} />
        </svg>
        <span style={{ fontSize: 32 }}>{common.appTitle}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: 68,
            lineHeight: 1.1,
            letterSpacing: -2,
            // Wraps before "multi-tenant" instead of at its hyphen.
            maxWidth: 820,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1.45,
            color: "#a3a3a3",
            maxWidth: 940,
          }}
        >
          {common.appDescription}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {stack.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                padding: "8px 18px",
                border: "1px solid #303030",
                borderRadius: 999,
                fontSize: 22,
                color: "#d4d4d4",
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 24, color: "#737373" }}>
          {new URL(appOrigin()).host}
        </span>
      </div>
    </div>,
    size
  )
}
