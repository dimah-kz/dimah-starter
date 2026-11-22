import { createElement, Fragment } from "react"
import { describe, expect, it } from "vitest"
import { getLocaleDirection, loadMessages, locales } from "@repo/i18n"
import { OgAccent, OgCard } from "./og-card"
import { renderImage } from "./render-image"

// Every locale's copy, in its own direction, with an accent span inside it.
// The span exercises the bidirectional layout that `next/og` got wrong; the
// art column is placed on the end side.
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
      eyebrow: common.appTitle,
      title: createElement(Fragment, null, accent, " ", common.appDescription),
      description: common.appDescription,
      art: createElement("div", { style: { width: 600, height: 400 } }),
    })

    const image = await renderImage(card, { width: 1200, height: 630 })

    expect(image.byteLength).toBeGreaterThan(0)
  })
})
