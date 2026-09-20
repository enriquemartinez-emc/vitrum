import { describe, expect, it } from "vitest"

import {
  completedOrderSchema,
  orderSchema,
  scheduledOrderSchema,
} from "@/core/orders/order.types"

describe("orderSchema", () => {
  it("parses a scheduled order", () => {
    const result = orderSchema.parse({
      id: 1,
      quoteId: 1,
      installationDate: "2026-10-01",
      status: "scheduled",
      createdAt: "2026-09-20T00:00:00Z",
      updatedAt: "2026-09-20T00:00:00Z",
    })
    expect(result.status).toBe("scheduled")
  })

  it("requires completedAt on a complete order", () => {
    expect(() =>
      completedOrderSchema.parse({
        id: 1,
        quoteId: 1,
        installationDate: "2026-10-01",
        status: "complete",
        createdAt: "2026-09-20T00:00:00Z",
        updatedAt: "2026-09-20T00:00:00Z",
      })
    ).toThrow()
  })

  it("rejects an installation date that isn't a plain date", () => {
    expect(() =>
      scheduledOrderSchema.parse({
        id: 1,
        quoteId: 1,
        installationDate: "2026-10-01T00:00:00Z",
        status: "scheduled",
        createdAt: "2026-09-20T00:00:00Z",
        updatedAt: "2026-09-20T00:00:00Z",
      })
    ).toThrow()
  })

  it("rejects a status the union doesn't recognize", () => {
    expect(() =>
      orderSchema.parse({
        id: 1,
        quoteId: 1,
        installationDate: "2026-10-01",
        status: "installed",
        createdAt: "2026-09-20T00:00:00Z",
        updatedAt: "2026-09-20T00:00:00Z",
      })
    ).toThrow()
  })
})
