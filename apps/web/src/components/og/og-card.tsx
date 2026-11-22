import type { PropsWithChildren, ReactNode } from "react"
import { brandMarkPath } from "@/components/brand-mark"
import { ogFontFamily } from "@/components/og/render-image"
import { appOrigin } from "@repo/auth/app-origin"
import { getLocaleDirection, loadMessages, type Locale } from "@repo/i18n"

/**
 * The light `:root` tokens of `globals.css` and the landing page accent.
 * Images cannot read CSS variables, so change these with them when you rebrand.
 */
export const ogColors = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.145 0 0)",
  muted: "oklch(0.97 0 0)",
  mutedForeground: "oklch(0.556 0 0)",
  border: "oklch(0.922 0 0)",
  sidebar: "oklch(0.985 0 0)",
  accentFrom: "#ff1e56",
  accentTo: "#0196ff",
} as const

const grid = `color-mix(in oklch, ${ogColors.foreground} 6%, ${ogColors.background})`

/** Width of the `art` column on the end side. */
const artWidth = 480

type OgCardProps = {
  locale: Locale
  /** A short label above the title, after a gradient hairline. */
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  /**
   * A drawing in a column on the end side, which may run off the card's edges.
   * Without it the text spans the card.
   */
  art?: ReactNode
}

/**
 * The 1200×630 share card, in the site's light theme: a drafting grid that
 * fades from the top, an eyebrow, the title and description, and the brand and
 * host at the bottom. It lays out in the locale's direction, so a Persian card
 * reads right to left with its art on the left. The title stops at three lines
 * and the description at two, with an ellipsis.
 */
export function OgCard({
  locale,
  eyebrow,
  title,
  description,
  art,
}: OgCardProps) {
  const dir = getLocaleDirection(locale)
  const { common } = loadMessages(locale)
  const end = dir === "rtl" ? "0%" : "100%"

  return (
    <div
      dir={dir}
      lang={locale}
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        fontFamily: ogFontFamily,
        color: ogColors.foreground,
        backgroundColor: ogColors.background,
        // A soft glow of both accents in the bottom end corner, over the
        // 64px grid of the landing page, faded out from the top center.
        backgroundImage: `radial-gradient(ellipse 45% 60% at ${end} 100%, color-mix(in oklch, ${ogColors.accentTo} 14%, transparent), transparent), radial-gradient(ellipse 35% 45% at ${dir === "rtl" ? "30%" : "70%"} 100%, color-mix(in oklch, ${ogColors.accentFrom} 10%, transparent), transparent), radial-gradient(ellipse 80% 75% at 50% 0%, transparent 0%, ${ogColors.background} 100%), linear-gradient(to right, ${grid} 1px, transparent 1px), linear-gradient(to bottom, ${grid} 1px, transparent 1px)`,
        backgroundSize: "100% 100%, 100% 100%, 100% 100%, 64px 64px, 64px 64px",
        backgroundPosition: "0 0, 0 0, 0 0, center 0, center 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          minWidth: 0,
          paddingBlock: 64,
          paddingInlineStart: 80,
          paddingInlineEnd: art ? 24 : 80,
        }}
      >
        {/* Empty without an eyebrow, so the title stays in the middle. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 24,
            fontWeight: 500,
            color: ogColors.mutedForeground,
          }}
        >
          {eyebrow ? (
            <>
              <div
                style={{
                  width: 44,
                  height: 2,
                  backgroundImage: `linear-gradient(to ${dir === "rtl" ? "left" : "right"}, ${ogColors.accentFrom}, ${ogColors.accentTo})`,
                }}
              />
              {eyebrow}
            </>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.12,
              // Negative tracking pulls joined scripts apart, so only LTR gets it.
              letterSpacing: dir === "ltr" ? "-0.03em" : 0,
              textWrap: "balance",
              lineClamp: 3,
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.45,
                color: ogColors.mutedForeground,
                textWrap: "balance",
                lineClamp: 2,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg
            viewBox="0 0 16.3 20.3"
            width={24}
            height={30}
            fill="currentColor"
          >
            <path fillRule="evenodd" d={brandMarkPath} />
          </svg>
          <span style={{ fontSize: 26, fontWeight: 600 }}>
            {common.appTitle}
          </span>
          <div
            style={{ width: 1, height: 22, backgroundColor: ogColors.border }}
          />
          <span
            dir="ltr"
            style={{ fontSize: 24, color: ogColors.mutedForeground }}
          >
            {new URL(appOrigin()).host}
          </span>
        </div>
      </div>

      {art ? (
        <div
          style={{
            display: "flex",
            position: "relative",
            width: artWidth,
            flexShrink: 0,
          }}
        >
          {art}
        </div>
      ) : null}
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
        backgroundImage: `linear-gradient(to ${dir === "rtl" ? "left" : "right"}, ${ogColors.accentFrom}, ${ogColors.accentTo})`,
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  )
}
