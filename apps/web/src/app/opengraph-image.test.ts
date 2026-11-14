import { describe, expect, it, vi } from "vitest"
import OpengraphImage, { alt, contentType, size } from "./opengraph-image"

vi.mock("next/cache", () => ({ cacheLife: vi.fn() }))

/** Width and height from a PNG's IHDR chunk. */
function pngSize(bytes: ArrayBuffer) {
  const view = new DataView(bytes)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

// Crawlers read `size` and `contentType` from the meta tags, so the rendered
// image has to match them. This also fails when the font or Takumi's native
// binding can't load.
describe("opengraph-image", () => {
  it("renders a PNG at the size and type it declares", async () => {
    const response = await OpengraphImage()

    expect(response.headers.get("content-type")).toBe(contentType)
    expect(pngSize(await response.arrayBuffer())).toEqual(size)
    expect(alt).not.toBe("")
  })
})
