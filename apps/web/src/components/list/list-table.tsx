import type { ReactNode } from "react"
import { Empty, EmptyHeader, EmptyTitle } from "@repo/ui/components/empty"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table"
import { cn } from "cn"
import type { ListColumn } from "@/components/list/types"

function columnChromeClass(columnId: string, isLast: boolean) {
  return cn("px-4", isLast && columnId !== "actions" && "pe-6")
}

type ListTableProps<T> = {
  rows: T[]
  columns: ListColumn<T>[]
  getRowId: (row: T) => string
  empty?: ReactNode
  caption?: ReactNode
  busy?: boolean
}

export function ListTable<T>({
  rows,
  columns,
  getRowId,
  empty,
  caption,
  busy,
}: ListTableProps<T>) {
  return (
    <Table
      aria-busy={busy || undefined}
      data-pending={busy ? "" : undefined}
      className={cn(busy && "pointer-events-none opacity-60")}
    >
      {caption ? (
        <TableCaption className="sr-only">{caption}</TableCaption>
      ) : null}
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead
              key={column.id}
              scope="col"
              className={cn(
                columnChromeClass(column.id, index === columns.length - 1),
                column.className
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={Math.max(columns.length, 1)}
              className="whitespace-normal"
              aria-live="polite"
            >
              {empty ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>{empty}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              ) : null}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((column, index) => (
                <TableCell
                  key={column.id}
                  className={cn(
                    columnChromeClass(column.id, index === columns.length - 1),
                    column.className
                  )}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
