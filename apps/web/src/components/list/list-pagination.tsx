"use client"

import type { ComponentProps, ReactNode } from "react"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@repo/ui/components/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select"
import { Button } from "@repo/ui/components/button"
import { formatNumber } from "@repo/i18n"
import { cn } from "cn"
import { useLocale, useTranslations } from "next-intl"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
  LIST_PAGE_SIZES,
  type ListPaginationProps,
} from "@/components/list/types"

function itemRange(page: number, pageSize: number, totalCount: number) {
  if (totalCount <= 0) {
    return { start: 0, end: 0 }
  }

  return {
    start: (page - 1) * pageSize + 1,
    end: Math.min(page * pageSize, totalCount),
  }
}

function pageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages: (number | "...")[] = [1]

  if (current > 3) {
    pages.push("...")
  }

  for (
    let page = Math.max(2, current - 1);
    page <= Math.min(total - 1, current + 1);
    page++
  ) {
    pages.push(page)
  }

  if (current < total - 2) {
    pages.push("...")
  }

  pages.push(total)
  return pages
}

type PageLinkProps = {
  href: string
  isActive?: boolean
  disabled?: boolean
  size?: ComponentProps<typeof Button>["size"]
  className?: string
  "aria-label"?: string
  children: ReactNode
}

function PageLink({
  href,
  isActive,
  disabled,
  size = "icon",
  className,
  "aria-label": ariaLabel,
  children,
}: PageLinkProps) {
  if (disabled) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </Button>
    )
  }

  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={className}
      nativeButton={false}
      render={
        <Link
          href={href}
          aria-label={ariaLabel}
          aria-current={isActive ? "page" : undefined}
        />
      }
    >
      {children}
    </Button>
  )
}

export function ListPagination({
  page,
  pageSize,
  totalCount,
  buildPageHref,
  onPageSizeChange,
  countLabel,
  className,
}: ListPaginationProps) {
  const locale = useLocale()
  const t = useTranslations("common")
  const formatValue = (value: number) => formatNumber(value, locale)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(page, totalPages)
  const { start, end } = itemRange(safePage, pageSize, totalCount)
  const showPagination = totalPages > 1
  const atFirst = safePage <= 1
  const atLast = safePage >= totalPages

  return (
    <div
      data-slot="list-pagination"
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 text-xs text-muted-foreground tabular-nums",
        className
      )}
    >
      <span
        className="shrink-0 max-sm:order-1"
        aria-live="polite"
        aria-atomic="true"
      >
        <span aria-hidden="true">
          {t("pagination.range", {
            start: formatValue(start),
            end: formatValue(end),
            total: formatValue(totalCount),
          })}
        </span>
        <span className="sr-only">
          {t("pagination.rangeAria", {
            start: formatValue(start),
            end: formatValue(end),
            total: formatValue(totalCount),
            countLabel,
          })}
        </span>
      </span>

      {showPagination ? (
        <Pagination
          aria-label={t("pagination.nav")}
          className="w-auto shrink-0 max-sm:order-3 max-sm:basis-full max-sm:justify-center"
        >
          <PaginationContent>
            <PaginationItem>
              <PageLink
                href={buildPageHref(Math.max(1, safePage - 1))}
                disabled={atFirst}
                size="default"
                className="ps-2!"
                aria-label={t("pagination.previous")}
              >
                <ChevronLeftIcon
                  data-icon="inline-start"
                  className="rtl:rotate-180"
                />
                <span className="hidden sm:block">
                  {t("pagination.previous")}
                </span>
              </PageLink>
            </PaginationItem>

            {pageNumbers(safePage, totalPages).map((num, index) =>
              num === "..." ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={num}>
                  <PageLink
                    href={buildPageHref(num)}
                    isActive={num === safePage}
                    aria-label={t("pagination.goToPage", {
                      page: formatValue(num),
                    })}
                  >
                    {formatValue(num)}
                  </PageLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PageLink
                href={buildPageHref(Math.min(totalPages, safePage + 1))}
                disabled={atLast}
                size="default"
                className="pe-2!"
                aria-label={t("pagination.next")}
              >
                <span className="hidden sm:block">{t("pagination.next")}</span>
                <ChevronRightIcon
                  data-icon="inline-end"
                  className="rtl:rotate-180"
                />
              </PageLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <Select
        value={String(pageSize)}
        onValueChange={(next) => {
          if (!next) {
            return
          }
          const parsed = Number.parseInt(next, 10)
          if (Number.isFinite(parsed)) {
            onPageSizeChange(parsed)
          }
        }}
      >
        <SelectTrigger
          size="sm"
          className="h-6 min-w-14 shrink-0 px-2 max-sm:order-2 max-sm:ms-auto"
          aria-label={t("pagination.rowsPerPage")}
        >
          <SelectValue>{formatValue(pageSize)}</SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {LIST_PAGE_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {formatValue(size)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
