import { describe, expect, it } from "vitest"
import {
  clampListPage,
  listPath,
  parseListPage,
  parseListQuery,
  toListSearchPattern,
} from "./params"
import { LIST_SEARCH_MAX_LENGTH, LIST_SEARCH_MIN_LENGTH } from "./types"

describe("parseListPage", () => {
  it.each([
    [{}, 1],
    [{ page: "3" }, 3],
    [{ page: ["4", "5"] }, 4],
    [{ page: "0" }, 1],
    [{ page: "-2" }, 1],
    [{ page: "abc" }, 1],
  ])("%j → %i", (searchParams, expected) => {
    expect(parseListPage(searchParams)).toBe(expected)
  })
})

describe("parseListQuery", () => {
  it("trims, caps the length and drops empty input", () => {
    expect(parseListQuery({ q: "  ada  " })).toBe("ada")
    expect(parseListQuery({ q: "   " })).toBeUndefined()
    expect(parseListQuery({ q: "x".repeat(500) })).toHaveLength(
      LIST_SEARCH_MAX_LENGTH
    )
  })
})

describe("toListSearchPattern", () => {
  it("skips queries below the minimum length", () => {
    expect(
      toListSearchPattern("x".repeat(LIST_SEARCH_MIN_LENGTH - 1))
    ).toBeUndefined()
  })

  it("escapes ILIKE wildcards so they match literally", () => {
    expect(toListSearchPattern("50%_off\\")).toBe("%50\\%\\_off\\\\%")
  })
})

describe("clampListPage", () => {
  it("keeps the page inside the result", () => {
    expect(clampListPage(9, 45, 20)).toBe(3)
    expect(clampListPage(0, 45, 20)).toBe(1)
    expect(clampListPage(2, 0, 20)).toBe(1)
  })
})

describe("listPath", () => {
  it("writes only non-default params", () => {
    expect(listPath("/x", { page: 1, pageSize: 20, filter: "all" }, 20)).toBe(
      "/x"
    )
    expect(
      listPath("/x", { page: 2, pageSize: 50, filter: "banned", q: " a " }, 20)
    ).toBe("/x?page=2&pageSize=50&filter=banned&q=a")
  })
})
