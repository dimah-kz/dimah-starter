import { expect, test } from "@playwright/test"

// `localeCookieName` in `@repo/i18n`. E2E tests drive the app from outside.
const localeCookieName = "NEXT_LOCALE"

test("Persian pages render right to left", async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: localeCookieName, value: "fa", url: baseURL! },
  ])

  await page.goto("/login")

  const html = page.locator("html")
  await expect(html).toHaveAttribute("lang", "fa")
  await expect(html).toHaveAttribute("dir", "rtl")
  await expect(page.getByRole("heading", { name: "ورود" })).toBeVisible()
})
