import { describe, expect, it } from "vitest"

import { rectangleSchema } from "@/core/shared/dimensions"
import { quantitySchema } from "@/core/shared/quantity"
import { glassPieceSchema } from "@/core/inventory/glass-piece.types"
import {
  allocateFromRunningStock,
  guillotineSplit,
  suggestCutPlan,
} from "@/core/inventory/cut-plan.rules"
import type { CutRequest } from "@/core/inventory/cut-plan.types"

const GLASS_TYPE_ID = 1

function piece(overrides: {
  id: number
  widthIn: number
  heightIn: number
  quantity: number
  origin?: "shipment" | "offcut"
}) {
  return glassPieceSchema.parse({
    id: overrides.id,
    glassTypeId: GLASS_TYPE_ID,
    widthIn: overrides.widthIn,
    heightIn: overrides.heightIn,
    quantity: overrides.quantity,
    origin: overrides.origin ?? "shipment",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  })
}

function request(overrides: {
  widthIn: number
  heightIn: number
  quantity: number
}): CutRequest {
  return {
    glassTypeId: GLASS_TYPE_ID as CutRequest["glassTypeId"],
    widthIn: overrides.widthIn as CutRequest["widthIn"],
    heightIn: overrides.heightIn as CutRequest["heightIn"],
    quantity: quantitySchema.parse(overrides.quantity),
  }
}

describe("guillotineSplit", () => {
  it("returns no offcuts on an exact fit", () => {
    const available = rectangleSchema.parse({ widthIn: 24, heightIn: 36 })
    const cut = rectangleSchema.parse({ widthIn: 24, heightIn: 36 })
    expect(guillotineSplit(available, cut)).toEqual([])
  })

  it("returns a single offcut spanning the full width when the cut uses the full width", () => {
    const available = rectangleSchema.parse({ widthIn: 24, heightIn: 60 })
    const cut = rectangleSchema.parse({ widthIn: 24, heightIn: 36 })
    expect(guillotineSplit(available, cut)).toEqual([
      { x: 0, y: 36, widthIn: 24, heightIn: 24 },
    ])
  })

  it("returns a single offcut spanning the full height when the cut uses the full height", () => {
    const available = rectangleSchema.parse({ widthIn: 60, heightIn: 36 })
    const cut = rectangleSchema.parse({ widthIn: 24, heightIn: 36 })
    expect(guillotineSplit(available, cut)).toEqual([
      { x: 24, y: 0, widthIn: 36, heightIn: 36 },
    ])
  })

  it("splits into two offcuts and keeps the larger one whole", () => {
    // Cutting 24x24 from a 96x36 sheet: horizontal-first leaves a 72x24 +
    // 96x12 (largest 72x24 = 12 sqft); vertical-first leaves a 24x12 +
    // 72x36 (largest 72x36 = 18 sqft). Vertical-first wins.
    const available = rectangleSchema.parse({ widthIn: 96, heightIn: 36 })
    const cut = rectangleSchema.parse({ widthIn: 24, heightIn: 24 })
    expect(guillotineSplit(available, cut)).toEqual([
      { x: 0, y: 24, widthIn: 24, heightIn: 12 },
      { x: 24, y: 0, widthIn: 72, heightIn: 36 },
    ])
  })
})

describe("suggestCutPlan", () => {
  it("fully fulfills from the single tightest-fitting piece", () => {
    const candidates = [
      piece({ id: 1, widthIn: 96, heightIn: 130, quantity: 5 }),
      piece({ id: 2, widthIn: 30, heightIn: 40, quantity: 3 }),
    ]
    const plan = suggestCutPlan(
      request({ widthIn: 24, heightIn: 36, quantity: 2 }),
      candidates
    )

    expect(plan.status).toBe("fulfilled")
    if (plan.status !== "fulfilled") throw new Error("expected fulfilled plan")
    expect(plan.allocations).toHaveLength(1)
    expect(plan.allocations[0].piece.id).toBe(2)
    expect(plan.allocations[0].quantityToCut).toBe(2)
  })

  it("ignores pieces that are too small or of a different glass type", () => {
    const tooSmall = piece({ id: 1, widthIn: 20, heightIn: 30, quantity: 5 })
    const wrongType = glassPieceSchema.parse({
      id: 2,
      glassTypeId: GLASS_TYPE_ID + 1,
      widthIn: 96,
      heightIn: 130,
      quantity: 5,
      origin: "shipment",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    })

    const plan = suggestCutPlan(
      request({ widthIn: 24, heightIn: 36, quantity: 1 }),
      [tooSmall, wrongType]
    )

    expect(plan.status).toBe("partial")
    if (plan.status !== "partial") throw new Error("expected partial plan")
    expect(plan.allocations).toEqual([])
    expect(plan.unfulfilledQuantity).toBe(1)
  })

  it("spans multiple pieces when one alone can't cover the requested quantity", () => {
    const candidates = [
      piece({ id: 1, widthIn: 30, heightIn: 40, quantity: 2 }),
      piece({ id: 2, widthIn: 96, heightIn: 130, quantity: 5 }),
    ]
    const plan = suggestCutPlan(
      request({ widthIn: 24, heightIn: 36, quantity: 3 }),
      candidates
    )

    expect(plan.status).toBe("fulfilled")
    if (plan.status !== "fulfilled") throw new Error("expected fulfilled plan")
    expect(plan.allocations).toHaveLength(2)
    expect(plan.allocations[0]).toMatchObject({ piece: { id: 1 }, quantityToCut: 2 })
    expect(plan.allocations[1]).toMatchObject({ piece: { id: 2 }, quantityToCut: 1 })
  })

  it("reports a partial plan with the shortfall when stock runs out", () => {
    const candidates = [piece({ id: 1, widthIn: 30, heightIn: 40, quantity: 2 })]
    const plan = suggestCutPlan(
      request({ widthIn: 24, heightIn: 36, quantity: 5 }),
      candidates
    )

    expect(plan.status).toBe("partial")
    if (plan.status !== "partial") throw new Error("expected partial plan")
    expect(plan.allocations).toHaveLength(1)
    expect(plan.allocations[0].quantityToCut).toBe(2)
    expect(plan.unfulfilledQuantity).toBe(3)
  })

  it("produces no offcuts when a piece's full quantity is consumed by an exact-fit cut", () => {
    const candidates = [piece({ id: 1, widthIn: 24, heightIn: 36, quantity: 2 })]
    const plan = suggestCutPlan(
      request({ widthIn: 24, heightIn: 36, quantity: 2 }),
      candidates
    )

    expect(plan.status).toBe("fulfilled")
    if (plan.status !== "fulfilled") throw new Error("expected fulfilled plan")
    expect(plan.allocations[0].offcuts).toEqual([])
  })

  it("positions the cut at the piece's bottom-left corner", () => {
    const candidates = [piece({ id: 1, widthIn: 30, heightIn: 40, quantity: 2 })]
    const plan = suggestCutPlan(
      request({ widthIn: 24, heightIn: 36, quantity: 1 }),
      candidates
    )

    expect(plan.status).toBe("fulfilled")
    if (plan.status !== "fulfilled") throw new Error("expected fulfilled plan")
    expect(plan.allocations[0].cut).toEqual({
      x: 0,
      y: 0,
      widthIn: 24,
      heightIn: 36,
    })
  })
})

describe("allocateFromRunningStock", () => {
  it("decrements the shared map so a second call sees less stock than the first", () => {
    const candidates = [piece({ id: 1, widthIn: 24, heightIn: 36, quantity: 3 })]
    const remainingByPieceId = new Map<number, number>()

    const first = allocateFromRunningStock(
      request({ widthIn: 24, heightIn: 36, quantity: 2 }),
      candidates,
      remainingByPieceId
    )
    expect(first.status).toBe("fulfilled")
    expect(remainingByPieceId.get(1)).toBe(1)

    const second = allocateFromRunningStock(
      request({ widthIn: 24, heightIn: 36, quantity: 2 }),
      candidates,
      remainingByPieceId
    )
    expect(second.status).toBe("partial")
    if (second.status !== "partial") throw new Error("expected partial plan")
    expect(second.unfulfilledQuantity).toBe(1)
    expect(remainingByPieceId.get(1)).toBe(0)
  })

  it("does not mutate the candidates array's own quantity, only the tracking map", () => {
    const candidates = [piece({ id: 1, widthIn: 24, heightIn: 36, quantity: 3 })]
    const remainingByPieceId = new Map<number, number>()

    allocateFromRunningStock(
      request({ widthIn: 24, heightIn: 36, quantity: 2 }),
      candidates,
      remainingByPieceId
    )

    expect(candidates[0].quantity).toBe(3)
  })
})
