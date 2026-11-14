import { instant } from "@next/playwright"
import { expect, test } from "@playwright/test"

test("the landing page renders its headline", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})

// The locale comes from a cookie, so a direct visit streams the page into the
// root layout's fallback. A client navigation renders the prefetched page.
test("the landing page opens instantly from sign in", async ({ page }) => {
  await page.goto("/login")

  await instant(page, async () => {
    await page.getByRole("link", { name: "Dimah Starter" }).click()
    await page.waitForURL((url) => url.pathname === "/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})

test("every response carries the security headers", async ({ request }) => {
  const response = await request.get("/")

  expect(response.headers()).toMatchObject({
    "x-frame-options": "DENY",
    "content-security-policy": "frame-ancestors 'none'",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "cross-origin-opener-policy": "same-origin",
  })
  expect(response.headers()).not.toHaveProperty("x-powered-by")
})

test("robots.txt keeps the app surfaces out of search", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text()

  expect(robots).toContain("Disallow: /dashboard")
  expect(robots).toContain("Disallow: /api/")
})
