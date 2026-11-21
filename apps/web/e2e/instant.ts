import { instant } from "@next/playwright"
import type { Page } from "@playwright/test"

/**
 * `instant()` locks further fetches. A prefetch still in flight when the lock
 * is taken never settles on headless Chromium, so the click stays on the
 * current page. Wait until this page's prefetches have finished first.
 */
export async function instantAfterPrefetch(
  page: Page,
  navigate: () => Promise<void>
) {
  await page.waitForLoadState("networkidle")
  await instant(page, navigate)
}
