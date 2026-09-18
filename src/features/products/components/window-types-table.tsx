import { PanelsTopLeftIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TablePagination } from "@/components/table-pagination"
import { formatMoney } from "@/core/shared/money"
import { AddWindowTypeButton } from "@/features/products/components/add-window-type-button"
import { WindowTypeRowActions } from "@/features/products/components/window-type-row-actions"
import type { WindowTypesPage } from "@/features/products/window-types.repository"

function pageHref(page: number) {
  return page === 1
    ? "/dashboard/products/window-types"
    : `/dashboard/products/window-types?page=${page}`
}

export function WindowTypesTable({
  windowTypesPage,
}: {
  windowTypesPage: WindowTypesPage
}) {
  const { windowTypes, page, pageSize, totalCount, totalPages } = windowTypesPage
  const firstRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "window type" : "window types"}
        </p>
        <AddWindowTypeButton />
      </div>

      {totalCount === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PanelsTopLeftIcon />
            </EmptyMedia>
            <EmptyTitle>No window types yet</EmptyTitle>
            <EmptyDescription>
              Add your first window type to start pricing quotes.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <AddWindowTypeButton />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Labor cost</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {windowTypes.length ? (
                  windowTypes.map((windowType) => (
                    <TableRow key={windowType.id}>
                      <TableCell className="font-medium">
                        {windowType.name}
                      </TableCell>
                      <TableCell>{formatMoney(windowType.laborCost)}</TableCell>
                      <TableCell>
                        <WindowTypeRowActions windowType={windowType} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {firstRow}–{lastRow} of {totalCount}
            </div>
            <TablePagination
              page={page}
              totalPages={totalPages}
              buildHref={pageHref}
            />
          </div>
        </>
      )}
    </div>
  )
}
