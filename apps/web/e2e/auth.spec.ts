import { instant } from "@next/playwright"
import { expect, test, type Page } from "@playwright/test"

test("the dashboard sends signed-out visitors to sign in", async ({ page }) => {
  await page.goto("/dashboard")

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
})

// Each auth form is its own Suspense fallback, so the prefetched page already
// holds the whole form.
test("sign up opens instantly from sign in", async ({ page }) => {
  await page.goto("/login")

  await instant(page, async () => {
    await page.getByRole("link", { name: "Sign up" }).click()
    await page.waitForURL((url) => url.pathname === "/signup")
    await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
  })
})

/** Where each sign-in form (email, Google) sends the visitor afterwards. */
async function redirectTargets(page: Page) {
  // `goto` resolves on `load`, after the streamed page replaced its fallback.
  return page
    .locator('input[name="redirectTo"]')
    .evaluateAll((inputs) => [
      ...new Set(inputs.map((input) => (input as HTMLInputElement).value)),
    ])
}

test.describe("redirect after sign in", () => {
  test("keeps a path inside the app", async ({ page }) => {
    await page.goto("/login?redirect=/dashboard/account")

    expect(await redirectTargets(page)).toEqual(["/dashboard/account"])
  })

  for (const target of [
    "https://evil.example",
    "//evil.example",
    "/.//evil.example",
  ]) {
    test(`drops ${target}`, async ({ page }) => {
      await page.goto(`/login?redirect=${encodeURIComponent(target)}`)

      expect(await redirectTargets(page)).toEqual(["/dashboard"])
    })
  }
})
