"use client"

import { useState } from "react"
import { ClipboardListIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Empty,
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
import { OrderDetailDrawer } from "@/features/orders/components/order-detail-drawer"
import { OrderRowActions } from "@/features/orders/components/order-row-actions"
import type { OrderSummary, OrdersPage } from "@/features/orders/repository"

const STATUS_LABEL: Record<OrderSummary["status"], string> = {
  scheduled: "Scheduled",
  complete: "Complete",
}

const STATUS_VARIANT: Record<OrderSummary["status"], "secondary" | "default"> = {
  scheduled: "secondary",
  complete: "default",
}

function pageHref(page: number) {
  return page === 1 ? "/dashboard/orders" : `/dashboard/orders?page=${page}`
}

export function OrdersTable({ ordersPage }: { ordersPage: OrdersPage }) {
  const { orders, page, pageSize, totalCount, totalPages } = ordersPage
  const firstRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalCount)

  const [detailOrderId, setDetailOrderId] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <p className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "order" : "orders"}
      </p>

      {totalCount === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>No orders yet</EmptyTitle>
            <EmptyDescription>
              Orders are created from an approved quote once an installation
              date is agreed.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Installation date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell>{order.installationDate}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[order.status]}>
                        {STATUS_LABEL[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatMoney(order.total)}</TableCell>
                    <TableCell>
                      <OrderRowActions onView={() => setDetailOrderId(order.id)} />
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

      <OrderDetailDrawer
        orderId={detailOrderId}
        open={detailOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailOrderId(null)
        }}
      />
    </div>
  )
}
