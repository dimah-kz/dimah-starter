import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { render, type RenderInput, type RenderOptions } from "takumi-js"

/** Family name for `fontFamily`. Vazirmatn covers Persian, Arabic and Latin. */
export const ogFontFamily = "Vazirmatn"

// Read once, at module scope, so prerendering sees no I/O. The path starts at
// the app root (`process.cwd()`), as in the Next.js docs: Turbopack turns
// `new URL(…, import.meta.url)` into a public `/_next/static` URL on the server.
// Registered without a `weight`, a variable font keeps its axes live, so
// `fontWeight` picks any weight from 100 to 900.
const vazirmatn = {
  name: ogFontFamily,
  data: await readFile(
    join(process.cwd(), "src/components/og/fonts/vazirmatn-variable.woff2")
  ),
}

/**
 * Renders JSX to image bytes, PNG unless `format` says otherwise. Every
 * generated image (`opengraph-image`, `twitter-image`, `apple-icon`) uses it.
 * Takumi lays out right-to-left and mixed-direction text correctly; `next/og`
 * (Satori) reverses Persian word order and splits words at the zero-width
 * non-joiner. Vazirmatn is always loaded; pass `fonts` only for scripts it
 * lacks.
 *
 * Call it inside a `'use cache'` function. Takumi renders on a native thread,
 * which Cache Components counts as request-time work, so without the cache the
 * route renders on every request instead of once at build.
 */
export async function renderImage(
  element: RenderInput,
  options: RenderOptions = {}
) {
  const image = await render(element, {
    ...options,
    fonts: options.fonts
      ? Promise.resolve(options.fonts).then((extra) => [vazirmatn, ...extra])
      : [vazirmatn],
  })

  // A plain `Uint8Array`, so a `'use cache'` entry can hold it.
  return new Uint8Array(image)
}
