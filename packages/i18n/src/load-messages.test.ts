import { describe, expect, it } from "vitest"
import { defaultLocale, locales } from "./config"
import { loadMessages } from "./load-messages"

/** Every leaf message as `namespace.key.path` → text. */
function flatten(value: unknown, prefix = ""): Map<string, string> {
  const entries = new Map<string, string>()
  if (typeof value === "string") return entries.set(prefix, value)
  for (const [key, child] of Object.entries(value as object)) {
    for (const entry of flatten(child, prefix ? `${prefix}.${key}` : key)) {
      entries.set(...entry)
    }
  }
  return entries
}

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()

// TypeScript only checks that a locale has every key of `en`. This also
// catches extra keys and a `{placeholder}` that one translation dropped.
describe.each(locales.filter((locale) => locale !== defaultLocale))(
  "%s messages",
  (locale) => {
    const reference = flatten(loadMessages(defaultLocale))
    const translated = flatten(loadMessages(locale))

    it("have exactly the default locale's keys", () => {
      expect([...translated.keys()].sort()).toEqual(
        [...reference.keys()].sort()
      )
    })

    it("keep every placeholder", () => {
      for (const [key, text] of reference) {
        expect(placeholders(translated.get(key) ?? ""), key).toEqual(
          placeholders(text)
        )
      }
    })
  }
)
