import type { MetadataRoute } from "next"
import { defaultLocale, loadMessages } from "@repo/i18n"

export default function manifest(): MetadataRoute.Manifest {
  const { common } = loadMessages(defaultLocale)

  return {
    name: common.appTitle,
    short_name: common.appTitle,
    description: common.appDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  }
}
