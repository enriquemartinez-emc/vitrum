"use client"

import { useState } from "react"
import { ClipboardListIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { formatMoney } from "@/core/shared/money"
import { OrderDetailDrawer } from "@/features/orders/components/order-detail-drawer"
import type { OrderSummary } from "@/features/orders/repository"

function isOverdue(installationDate: string): boolean {
  return new Date(installationDate) < new Date(new Date().toDateString())
}

export function DashboardPendingOrders({ orders }: { orders: OrderSummary[] }) {
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {orders.length} pending {orders.length === 1 ? "order" : "orders"}
        </p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/orders" />}
        >
          View all orders
        </Button>
      </div>

      {orders.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>No orders pending</EmptyTitle>
            <EmptyDescription>
              Every scheduled order has been installed and marked complete.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Installation date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Overdue</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => setDetailOrderId(order.id)}
                >
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.installationDate}
                  </TableCell>
                  <TableCell>{formatMoney(order.total)}</TableCell>
                  <TableCell>
                    {isOverdue(order.installationDate) && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
