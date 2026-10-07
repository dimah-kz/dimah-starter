import { config } from "dotenv"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

config({ path: "../../.env" })

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: [
    "@repo/ui",
    "@repo/api",
    "@repo/auth",
    "@repo/email",
    "@repo/db",
    "@repo/i18n",
    "@repo/storage",
  ],
}

export default withNextIntl(nextConfig)
