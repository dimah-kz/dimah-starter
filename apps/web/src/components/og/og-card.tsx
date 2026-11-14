import type { PropsWithChildren, ReactNode } from "react"
import { brandMarkPath } from "@/components/brand-mark"
import { ogFontFamily } from "@/components/og/render-image"
import { appOrigin } from "@repo/auth/app-origin"
import { getLocaleDirection, loadMessages, type Locale } from "@repo/i18n"

/**
 * The `.dark` tokens of `globals.css` and the landing page accent. Images
 * cannot read CSS variables, so change these with them when you rebrand.
 */
const colors = {
  background: "oklch(0.145 0 0)",
  foreground: "oklch(0.985 0 0)",
  mutedForeground: "oklch(0.708 0 0)",
  subtle: "oklch(0.556 0 0)",
  border: "oklch(1 0 0 / 15%)",
  accentFrom: "#ff1e56",
  accentTo: "#0196ff",
} as const

type OgCardProps = {
  locale: Locale
  title: ReactNode
  description?: ReactNode
  /** Short labels in the footer, such as the stack or a section name. */
  tags?: readonly string[]
}

/**
 * The 1200×630 share card: brand, title, description, tags and the site host.
 * It lays out in the locale's direction, so a Persian card reads right to left.
 * Titles and descriptions stop at three lines each, with an ellipsis, so the
 * longest of both still fits.
 */
export function OgCard({ locale, title, description, tags = [] }: OgCardProps) {
  const dir = getLocaleDirection(locale)
  const { common } = loadMessages(locale)

  return (
    <div
      dir={dir}
      lang={locale}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        padding: 72,
        fontFamily: ogFontFamily,
        color: colors.foreground,
        backgroundColor: colors.background,
        backgroundImage: `radial-gradient(circle at 0% 0%, color-mix(in oklch, ${colors.accentFrom} 20%, transparent), transparent 40%), radial-gradient(circle at 100% 100%, color-mix(in oklch, ${colors.accentTo} 20%, transparent), transparent 45%)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg viewBox="0 0 16.3 20.3" width={36} height={45} fill="currentColor">
          <path fillRule="evenodd" d={brandMarkPath} />
        </svg>
        <span style={{ fontSize: 32, fontWeight: 500 }}>{common.appTitle}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            maxWidth: 980,
            fontSize: 68,
            fontWeight: 600,
            lineHeight: 1.2,
            // Negative tracking pulls joined scripts apart, so only LTR gets it.
            letterSpacing: dir === "ltr" ? -2 : 0,
            textWrap: "balance",
            lineClamp: 3,
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              maxWidth: 960,
              fontSize: 26,
              lineHeight: 1.45,
              color: colors.mutedForeground,
              lineClamp: 3,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "8px 18px",
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
                fontSize: 22,
                color: colors.mutedForeground,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <span dir="ltr" style={{ fontSize: 24, color: colors.subtle }}>
          {new URL(appOrigin()).host}
        </span>
      </div>
    </div>
  )
}

/**
 * Gradient text, like the landing page headline's `<accent>`. The gradient
 * starts on the reading side, so pass the card's direction.
 */
export function OgAccent({
  dir,
  children,
}: PropsWithChildren<{ dir: "ltr" | "rtl" }>) {
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(to ${dir === "rtl" ? "left" : "right"}, ${colors.accentFrom}, ${colors.accentTo})`,
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  )
}
