import { format } from "date-fns"
import { PackageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import type { GlassType } from "@/core/products/glass-type.types"
import { RegisterShipmentButton } from "@/features/inventory/components/register-shipment-button"
import type { GlassPiecesPage } from "@/features/inventory/repository"

const ORIGIN_LABEL: Record<GlassPiecesPage["pieces"][number]["origin"], string> = {
  shipment: "Shipment",
  offcut: "Offcut",
}

function pageHref(page: number) {
  return page === 1 ? "/dashboard/inventory" : `/dashboard/inventory?page=${page}`
}

export function InventoryTable({
  piecesPage,
  glassTypes,
}: {
  piecesPage: GlassPiecesPage
  glassTypes: GlassType[]
}) {
  const { pieces, page, pageSize, totalCount, totalPages } = piecesPage
  const firstRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "piece" : "pieces"} in stock
        </p>
        <RegisterShipmentButton glassTypes={glassTypes} />
      </div>

      {totalCount === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>No glass in stock</EmptyTitle>
            <EmptyDescription>
              Register a shipment to start tracking glass inventory.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <RegisterShipmentButton glassTypes={glassTypes} />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead>Glass type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pieces.map((piece) => (
                  <TableRow key={piece.id}>
                    <TableCell className="font-medium">{piece.glassTypeName}</TableCell>
                    <TableCell>
                      {piece.widthIn}×{piece.heightIn}in
                    </TableCell>
                    <TableCell>{piece.quantity}</TableCell>
                    <TableCell>
                      <Badge variant={piece.origin === "shipment" ? "secondary" : "outline"}>
                        {ORIGIN_LABEL[piece.origin]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(piece.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {firstRow}–{lastRow} of {totalCount}
            </div>
            <TablePagination page={page} totalPages={totalPages} buildHref={pageHref} />
          </div>
        </>
      )}
    </div>
  )
}
