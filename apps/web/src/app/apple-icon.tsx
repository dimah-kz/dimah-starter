import { cacheLife } from "next/cache"
import { brandMarkPath } from "@/components/brand-mark"
import { renderImage } from "@/components/og/render-image"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default async function AppleIcon() {
  return new Response(await renderAppleIcon(), {
    headers: { "Content-Type": contentType },
  })
}

// Cached, so the build prerenders it.
async function renderAppleIcon() {
  "use cache"
  cacheLife("max")

  return renderImage(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Same optical centering as `icon.svg`. */}
      <svg viewBox="-2 0 20.3 20.3" width={112} height={112} fill="#fafafa">
        <path fillRule="evenodd" d={brandMarkPath} />
      </svg>
    </div>,
    size
  )
}
