import { cacheLife } from "next/cache"
import { createTranslator } from "next-intl"
import { OgAccent, OgCard, ogColors } from "@/components/og/og-card"
import { renderImage } from "@/components/og/render-image"
import { defaultLocale, getLocaleDirection, loadMessages } from "@repo/i18n"

/** Share image for every route. Crawlers send no locale cookie, so it uses the default locale. */
const locale = defaultLocale
const messages = loadMessages(locale)
const t = createTranslator({ locale, messages, namespace: "marketing.home" })

export const alt = t("metaTitle")
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const stack = ["Better Auth", "Drizzle", "Postgres", "shadcn/ui"]

export default async function OpengraphImage() {
  return new Response(await renderShareImage(), {
    headers: { "Content-Type": contentType },
  })
}

// Cached, so the build prerenders it. Its copy changes only with a deploy.
async function renderShareImage() {
  "use cache"
  cacheLife("max")

  const dir = getLocaleDirection(locale)

  // The landing page's hero beside a sketch of the dashboard it starts you on.
  return renderImage(
    <OgCard
      locale={locale}
      eyebrow={t("eyebrow")}
      title={t.rich("headline", {
        accent: (chunks) => <OgAccent dir={dir}>{chunks}</OgAccent>,
      })}
      description={<span dir="ltr">{stack.join(" · ")}</span>}
      art={<DashboardSketch dir={dir} />}
    />,
    size
  )
}

const line = "oklch(0.9 0 0)"
const lineStrong = "oklch(0.8 0 0)"
const tint = (color: string, amount: number) =>
  `color-mix(in oklch, ${color} ${amount}%, ${ogColors.background})`

/** Members table rows: avatar color and role badge (owner, admin, member). */
const members = [
  { avatar: tint(ogColors.accentFrom, 30), role: tint(ogColors.accentTo, 16) },
  { avatar: tint(ogColors.accentTo, 30), role: tint(ogColors.accentFrom, 12) },
  { avatar: "oklch(0.9 0 0)", role: ogColors.muted },
  { avatar: tint(ogColors.accentTo, 18), role: ogColors.muted },
  { avatar: tint(ogColors.accentFrom, 16), role: ogColors.muted },
]

/** Width of the page content, which stays inside the card while the window runs off it. */
const pageWidth = 284

/**
 * A wireframe of the organization dashboard (switcher, sidebar, members with
 * roles) in a browser window that runs off the card's end and bottom edges.
 * Text-free skeleton bars, so it needs no copy in any locale.
 */
function DashboardSketch({ dir }: { dir: "ltr" | "rtl" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        top: 120,
        [dir === "rtl" ? "right" : "left"]: 0,
        width: 560,
        height: 560,
        overflow: "hidden",
        backgroundColor: ogColors.background,
        border: `1px solid ${ogColors.border}`,
        borderRadius: 18,
        boxShadow:
          "0 30px 80px -24px rgb(0 0 0 / 0.18), 0 4px 12px rgb(0 0 0 / 0.04)",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 46,
          paddingInline: 18,
          borderBottom: `1px solid ${ogColors.border}`,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              backgroundColor: line,
            }}
          />
        ))}
        <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              width: 200,
              height: 22,
              borderRadius: 999,
              backgroundColor: ogColors.muted,
            }}
          />
        </div>
        <div style={{ width: 49 }} />
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar: organization switcher and navigation */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            width: 156,
            padding: 14,
            backgroundColor: ogColors.sidebar,
            borderInlineEnd: `1px solid ${ogColors.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundImage: `linear-gradient(135deg, ${ogColors.accentFrom}, ${ogColors.accentTo})`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Bar width={74} height={8} color={lineStrong} />
              <Bar width={48} height={6} color={line} />
            </div>
          </div>
          {[66, 80, 54, 72, 58].map((width, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 32,
                paddingInline: 10,
                borderRadius: 7,
                backgroundColor: index === 1 ? ogColors.muted : "transparent",
              }}
            >
              <Bar
                width={14}
                height={14}
                color={index === 1 ? ogColors.foreground : line}
              />
              <Bar
                width={width}
                height={7}
                color={index === 1 ? lineStrong : line}
              />
            </div>
          ))}
        </div>

        {/* Members page */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: pageWidth,
            flexShrink: 0,
            padding: "24px 0",
            marginInlineStart: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <Bar width={112} height={12} color="oklch(0.25 0 0)" />
              <Bar width={160} height={7} color={line} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 76,
                height: 28,
                borderRadius: 8,
                backgroundColor: ogColors.foreground,
              }}
            >
              <Bar width={38} height={6} color="oklch(0.985 0 0 / 0.7)" />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${ogColors.border}`,
              borderRadius: 12,
            }}
          >
            {members.map((member, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 54,
                  paddingInline: 14,
                  borderTop:
                    index === 0 ? "none" : `1px solid ${ogColors.border}`,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    backgroundColor: member.avatar,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flex: 1,
                  }}
                >
                  <Bar width={84 - index * 6} height={8} color={lineStrong} />
                  <Bar width={118 - index * 8} height={6} color={line} />
                </div>
                <div
                  style={{
                    width: 52,
                    height: 20,
                    borderRadius: 999,
                    backgroundColor: member.role,
                    border: `1px solid ${ogColors.border}`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Bar({
  width,
  height,
  color,
}: {
  width: number
  height: number
  color: string
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: Math.min(height / 2, 4),
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  )
}
