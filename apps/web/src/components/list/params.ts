import {
  LIST_PAGE_SIZES,
  LIST_SEARCH_MAX_LENGTH,
  LIST_SEARCH_MIN_LENGTH,
  type ListSearchParamsInput,
} from "@/components/list/types"

type SearchParams = Record<string, string | string[] | undefined>

const first = (value: string | string[] | undefined) =>
  value === undefined ? undefined : Array.isArray(value) ? value[0] : value

export function parseListPage(searchParams: SearchParams): number {
  const parsed = Number.parseInt(first(searchParams.page) ?? "", 10)
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1
}

export function parseListPageSize(
  searchParams: SearchParams,
  defaultPageSize: number
): number {
  const parsed = Number.parseInt(first(searchParams.pageSize) ?? "", 10)
  return (LIST_PAGE_SIZES as readonly number[]).includes(parsed)
    ? parsed
    : defaultPageSize
}

export function parseListFilter(searchParams: SearchParams) {
  return first(searchParams.filter)?.trim() || undefined
}

export function parseListQuery(searchParams: SearchParams) {
  return (
    first(searchParams.q)?.trim().slice(0, LIST_SEARCH_MAX_LENGTH) || undefined
  )
}

/**
 * `ILIKE` pattern that matches `q` anywhere, or `undefined` when `q` is shorter
 * than the search minimum. `%`, `_` and `\` in `q` match literally.
 */
export function toListSearchPattern(q: string | undefined) {
  if (!q || q.length < LIST_SEARCH_MIN_LENGTH) {
    return undefined
  }

  return `%${q.replace(/[\\%_]/g, "\\$&")}%`
}

export function parseListEnumFilter<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback
}

export function clampListPage(
  page: number,
  totalCount: number,
  pageSize: number
): number {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  return Math.min(Math.max(1, page), totalPages)
}

/** `pathname` plus the non-default list params; filter `"all"` is the default. */
export function listPath(
  pathname: string,
  input: ListSearchParamsInput,
  defaultPageSize: number
): string {
  const params = new URLSearchParams()

  if (input.page !== undefined && input.page > 1) {
    params.set("page", String(input.page))
  }

  if (input.pageSize !== undefined && input.pageSize !== defaultPageSize) {
    params.set("pageSize", String(input.pageSize))
  }

  const filter = input.filter?.trim()
  if (filter && filter !== "all") {
    params.set("filter", filter)
  }

  const q = input.q?.trim()
  if (q) {
    params.set("q", q)
  }

  const serialized = params.toString()
  return serialized ? `${pathname}?${serialized}` : pathname
}
