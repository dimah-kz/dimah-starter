"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import type {
  ListPaginationProps,
  ListSearchParamsInput,
} from "@/components/list/types"

type UseListOptions<TFilter extends string = string> = {
  buildPath: (input: ListSearchParamsInput & { filter?: TFilter }) => string
  page: number
  pageSize: number
  totalCount: number
  filter?: TFilter
  q?: string
  countLabel: string
}

export function useList<TFilter extends string = string>({
  buildPath,
  page,
  pageSize,
  totalCount,
  filter,
  q,
  countLabel,
}: UseListOptions<TFilter>) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = (
    patch: Partial<{ page: number; pageSize: number; filter: TFilter }> & {
      q?: string
    }
  ) => {
    startTransition(() => {
      router.push(
        buildPath({
          page: patch.page ?? page,
          pageSize: patch.pageSize ?? pageSize,
          filter: patch.filter ?? filter,
          q: "q" in patch ? patch.q : q,
        })
      )
    })
  }

  const pagination: ListPaginationProps = {
    page,
    pageSize,
    totalCount,
    countLabel,
    buildPageHref: (nextPage) =>
      buildPath({ page: nextPage, pageSize, filter, q }),
    onPageSizeChange: (nextPageSize) =>
      navigate({ page: 1, pageSize: nextPageSize }),
  }

  return {
    isPending,
    setQuery: (nextQuery?: string) => navigate({ page: 1, q: nextQuery }),
    setFilter: (nextFilter: TFilter) =>
      navigate({ page: 1, filter: nextFilter }),
    pagination,
  }
}
