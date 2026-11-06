import type { ReactNode } from "react"

export const LIST_PAGE_SIZES = [10, 20, 50, 100] as const

export const LIST_SEARCH_MIN_LENGTH = 2

/** Longer search input is cut — it only feeds an `ILIKE` and a cache key. */
export const LIST_SEARCH_MAX_LENGTH = 100

export type ListColumn<T> = {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
}

export type ListSearchParamsInput = {
  page?: number
  pageSize?: number
  filter?: string
  q?: string
}

export type ListPaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  buildPageHref: (page: number) => string
  onPageSizeChange: (pageSize: number) => void
  /** Already-localized noun for screen readers, e.g. `members` */
  countLabel: string
  className?: string
}
