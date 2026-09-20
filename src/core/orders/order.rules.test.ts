import { describe, expect, it } from "vitest"

import { completeOrder, createOrder } from "@/core/orders/order.rules"
import type { OrderId } from "@/core/orders/order.types"
import { scheduledOrderSchema } from "@/core/orders/order.types"
import { pendingQuoteSchema, approvedQuoteSchema } from "@/core/quotes/quote.types"

const pending = pendingQuoteSchema.parse({
  id: 1,
  customerId: 1,
  status: "pending",
  lineItems: [
    {
      id: 1,
      windowTypeId: 1,
      glassTypeId: 1,
      widthIn: 24,
      heightIn: 36,
      quantity: 1,
      unitPrice: 18000,
      lineTotal: 18000,
    },
  ],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
})

const approved = approvedQuoteSchema.parse({
  ...pending,
  status: "approved",
  approvedAt: "2026-01-05T00:00:00Z",
})

describe("createOrder", () => {
  it("builds a scheduled order referencing the approved quote", () => {
    const order = createOrder(
      approved,
      1 as OrderId,
      "2026-10-01",
      "2026-09-20T00:00:00Z"
    )

    expect(order.status).toBe("scheduled")
    expect(order.quoteId).toBe(approved.id)
    expect(order.installationDate).toBe("2026-10-01")
    expect(order.createdAt).toBe(order.updatedAt)
  })
})

describe("completeOrder", () => {
  it("carries the order's fields forward and adds completedAt", () => {
    const scheduled = scheduledOrderSchema.parse({
      id: 1,
      quoteId: 1,
      installationDate: "2026-10-01",
      status: "scheduled",
      createdAt: "2026-09-20T00:00:00Z",
      updatedAt: "2026-09-20T00:00:00Z",
    })

    const completed = completeOrder(scheduled, "2026-10-02T00:00:00Z")

    expect(completed.status).toBe("complete")
    expect(completed.completedAt).toBe("2026-10-02T00:00:00Z")
    expect(completed.installationDate).toBe("2026-10-01")
    expect(completed.createdAt).toBe(scheduled.createdAt)
  })
})
