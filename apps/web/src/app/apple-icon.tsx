import { ImageResponse } from "next/og"
import { brandMarkPath } from "@/components/brand-mark"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
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
