import { expect, test, type Page } from "@playwright/test"
import { instantAfterPrefetch } from "./instant"

test("the dashboard sends signed-out visitors to sign in", async ({ page }) => {
  await page.goto("/dashboard")

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
})

// Each auth form is its own Suspense fallback, so the prefetched page already
// holds the whole form.
test("sign up opens instantly from sign in", async ({ page }) => {
  await page.goto("/login")

  await instantAfterPrefetch(page, async () => {
    await page.getByRole("link", { name: "Sign up" }).click()
    await page.waitForURL((url) => url.pathname === "/signup")
    await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
  })
})

/**
 * Where each sign-in form (email, Google) sends the visitor afterwards.
 * `goto` resolves on `load`, which can beat Next's Suspense reveal: until
 * `$RV` runs, the shell's target and the streamed target are both in the
 * document, and the streamed one sits under `[hidden]`.
 */
async function redirectTargets(page: Page) {
  const inputs = page.locator('input[name="redirectTo"]')
  let targets: string[] | null = null

  await expect
    .poll(async () => {
      targets = await inputs.evaluateAll((nodes) => {
        const revealed = nodes.filter(
          (node) => node.closest("[hidden]") == null
        )
        if (revealed.length === 0 || revealed.length !== nodes.length) {
          return null
        }

        return [
          ...new Set(revealed.map((node) => (node as HTMLInputElement).value)),
        ]
      })
      return targets
    })
    .not.toBeNull()

  return targets ?? []
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
