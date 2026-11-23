import { describe, expect, it } from "vitest"
import { fa } from "./fa"

/** `{name}` placeholders of a key's English text, without its `(context)`. */
function placeholders(text: string) {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()
}

describe("Persian dimah-s3 strings", () => {
  it.each(Object.entries(fa))("%s keeps its placeholders", (key, value) => {
    const source = key.replace(/\([^()]*\)$/, "")
    expect(placeholders(value)).toEqual(placeholders(source))
  })
})
