import { createElement, Fragment } from "react"
import { describe, expect, it } from "vitest"
import { getLocaleDirection, loadMessages, locales } from "@repo/i18n"
import { OgAccent, OgCard } from "./og-card"
import { renderImage } from "./render-image"

// Every locale's copy, in its own direction, with an accent span inside it.
// The span exercises the bidirectional layout that `next/og` got wrong.
describe("OgCard", () => {
  it.each(locales)("renders the %s card", async (locale) => {
    const { common } = loadMessages(locale)
    const accent = createElement(
      OgAccent,
      { dir: getLocaleDirection(locale) },
      common.appTitle
    )
    const card = createElement(OgCard, {
      locale,
      title: createElement(Fragment, null, accent, " ", common.appDescription),
      description: common.appDescription,
      tags: ["Next.js", "i18n + RTL"],
    })

    const image = await renderImage(card, { width: 1200, height: 630 })

    expect(image.byteLength).toBeGreaterThan(0)
  })
})
