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
import { CreateOrderDialog } from "@/features/orders/components/create-order-dialog"
import { declineQuoteAction, getQuoteDetailAction } from "@/features/quotes/actions"
import type { QuoteDetail } from "@/features/quotes/repository"

const STATUS_LABEL: Record<QuoteDetail["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
}

const STATUS_VARIANT: Record<QuoteDetail["status"], "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  declined: "destructive",
}

export function QuoteDetailDrawer({
  quoteId,
  open,
  onOpenChange,
}: {
  quoteId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [detail, setDetail] = useState<QuoteDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [createOrderOpen, setCreateOrderOpen] = useState(false)

  useEffect(() => {
    if (!open || quoteId === null) {
      setDetail(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    getQuoteDetailAction(quoteId)
      .then((result) => {
        if (!cancelled) setDetail(result)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, quoteId])

  function handleDecline() {
    if (quoteId === null) return
    startTransition(async () => {
      await declineQuoteAction(quoteId)
      onOpenChange(false)
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="[--drawer-content-width:100dvw]! sm:[--drawer-content-width:28rem]!">
        <DrawerHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <DrawerTitle>Quote details</DrawerTitle>
              <DrawerDescription>
                {detail ? detail.customerName : "Loading quote…"}
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

              {detail.order && (
                <p className="text-sm text-muted-foreground">
                  {detail.order.status === "complete"
                    ? "Order installed and complete."
                    : `Order scheduled for ${detail.order.installationDate}.`}
                </p>
              )}
            </>
          )}
        </div>

        {detail?.status === "pending" && (
          <DrawerFooter>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button onClick={() => setCreateOrderOpen(true)}>Approve</Button>
          </DrawerFooter>
        )}

        {detail?.status === "approved" && !detail.order && (
          <DrawerFooter>
            <Button onClick={() => setCreateOrderOpen(true)}>Create order</Button>
          </DrawerFooter>
        )}
      </DrawerContent>

      {detail && (
        <CreateOrderDialog
          quoteId={detail.id}
          open={createOrderOpen}
          onOpenChange={setCreateOrderOpen}
          onCreated={() => {
            getQuoteDetailAction(detail.id).then(setDetail)
          }}
        />
      )}
    </Drawer>
  )
}
