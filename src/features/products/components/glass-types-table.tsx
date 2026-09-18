import { LayersIcon } from "lucide-react"

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
import { productsHref } from "@/features/products/build-href"
import { AddGlassTypeButton } from "@/features/products/components/add-glass-type-button"
import { GlassTypeRowActions } from "@/features/products/components/glass-type-row-actions"
import type { GlassTypesPage } from "@/features/products/glass-types.repository"

export function GlassTypesTable({
  glassTypesPage,
  windowPage,
}: {
  glassTypesPage: GlassTypesPage
  windowPage: number
}) {
  const { glassTypes, page, pageSize, totalCount, totalPages } = glassTypesPage
  const firstRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalCount)
  const buildHref = (targetPage: number) =>
    productsHref("glass-types", windowPage, targetPage)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "glass type" : "glass types"}
        </p>
        <AddGlassTypeButton />
      </div>

      {totalCount === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayersIcon />
            </EmptyMedia>
            <EmptyTitle>No glass types yet</EmptyTitle>
            <EmptyDescription>
              Add your first glass type to start pricing quotes.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <AddGlassTypeButton />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price per sq ft</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {glassTypes.length ? (
                  glassTypes.map((glassType) => (
                    <TableRow key={glassType.id}>
                      <TableCell className="font-medium">
                        {glassType.name}
                      </TableCell>
                      <TableCell>
                        {formatMoney(glassType.pricePerSqFt)}
                      </TableCell>
                      <TableCell>
                        <GlassTypeRowActions glassType={glassType} />
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
              buildHref={buildHref}
            />
          </div>
        </>
      )}
    </div>
  )
}
