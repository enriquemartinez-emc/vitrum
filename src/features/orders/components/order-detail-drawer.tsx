"use client"

import { useEffect, useState, useTransition } from "react"
import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import { formatMoney } from "@/core/shared/money"
import {
  completeOrderAction,
  getOrderDetailAction,
} from "@/features/orders/actions"
import type { OrderDetail } from "@/features/orders/repository"

const STATUS_LABEL: Record<OrderDetail["status"], string> = {
  scheduled: "Scheduled",
  complete: "Complete",
}

const STATUS_VARIANT: Record<OrderDetail["status"], "secondary" | "default"> = {
  scheduled: "secondary",
  complete: "default",
}

export function OrderDetailDrawer({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open || orderId === null) {
      setDetail(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    getOrderDetailAction(orderId)
      .then((result) => {
        if (!cancelled) setDetail(result)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, orderId])

  function handleComplete() {
    if (orderId === null) return
    startTransition(async () => {
      await completeOrderAction(orderId)
      onOpenChange(false)
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="[--drawer-content-width:100dvw]! sm:[--drawer-content-width:28rem]!">
        <DrawerHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <DrawerTitle>Order details</DrawerTitle>
              <DrawerDescription>
                {detail ? detail.customerName : "Loading order…"}
              </DrawerDescription>
            </div>
            <DrawerClose render={<Button variant="ghost" size="icon" className="shrink-0" />}>
              <XIcon />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Spinner className="size-6" />
            </div>
          )}

          {detail && (
            <>
              <div className="flex items-center justify-between">
                <Badge variant={STATUS_VARIANT[detail.status]}>
                  {STATUS_LABEL[detail.status]}
                </Badge>
                <span className="text-sm font-medium">
                  {formatMoney(detail.total)} total
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Installation date: {detail.installationDate}
              </p>

              <div className="flex flex-col gap-3">
                {detail.lineItems.map((lineItem) => (
                  <div key={lineItem.id} className="flex flex-col gap-1 rounded-lg border p-3">
                    <p className="text-sm font-medium">
                      {lineItem.windowTypeName} · {lineItem.glassTypeName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lineItem.widthIn}×{lineItem.heightIn}in, qty {lineItem.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(lineItem.unitPrice)} / unit ·{" "}
                      {formatMoney(lineItem.lineTotal)} total
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {detail?.status === "scheduled" && (
          <DrawerFooter>
            <Button disabled={isPending} onClick={handleComplete}>
              Mark complete
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
