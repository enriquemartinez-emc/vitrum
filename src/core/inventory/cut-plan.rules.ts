import {
  areaSqFt,
  positionedRectangleSchema,
  type PositionedRectangle,
  type Rectangle,
} from "@/core/shared/dimensions"
import { quantitySchema } from "@/core/shared/quantity"
import type { GlassPiece } from "@/core/inventory/glass-piece.types"
import type {
  CutAllocation,
  CutPlan,
  CutRequest,
} from "@/core/inventory/cut-plan.types"

// A single guillotine cut splits the remainder into two rectangles; which of
// the two valid splits (horizontal-first vs vertical-first) is used changes
// their shapes. We pick whichever split leaves the larger single rectangle,
// since one bigger reusable offcut is generally more useful for future cuts
// than two smaller ones of the same combined area.
//
// The cut is placed at the available rectangle's bottom-left corner (0, 0);
// offcut positions are relative to that same corner, so a caller can render
// an accurate diagram directly from this output.
export function guillotineSplit(
  available: Rectangle,
  cut: Rectangle
): PositionedRectangle[] {
  const rightWidth = available.widthIn - cut.widthIn
  const topHeight = available.heightIn - cut.heightIn

  if (rightWidth === 0 && topHeight === 0) return []

  if (rightWidth === 0) {
    return [
      positionedRectangleSchema.parse({
        x: 0,
        y: cut.heightIn,
        widthIn: available.widthIn,
        heightIn: topHeight,
      }),
    ]
  }

  if (topHeight === 0) {
    return [
      positionedRectangleSchema.parse({
        x: cut.widthIn,
        y: 0,
        widthIn: rightWidth,
        heightIn: available.heightIn,
      }),
    ]
  }

  const horizontalFirst = [
    positionedRectangleSchema.parse({
      x: cut.widthIn,
      y: 0,
      widthIn: rightWidth,
      heightIn: cut.heightIn,
    }),
    positionedRectangleSchema.parse({
      x: 0,
      y: cut.heightIn,
      widthIn: available.widthIn,
      heightIn: topHeight,
    }),
  ]
  const verticalFirst = [
    positionedRectangleSchema.parse({
      x: 0,
      y: cut.heightIn,
      widthIn: cut.widthIn,
      heightIn: topHeight,
    }),
    positionedRectangleSchema.parse({
      x: cut.widthIn,
      y: 0,
      widthIn: rightWidth,
      heightIn: available.heightIn,
    }),
  ]

  const largestArea = (rectangles: Rectangle[]) =>
    Math.max(...rectangles.map(areaSqFt))

  return largestArea(horizontalFirst) >= largestArea(verticalFirst)
    ? horizontalFirst
    : verticalFirst
}

// No rotation support: a candidate piece must already fit the requested
// width/height as-is.
function fitsWithoutRotation(piece: GlassPiece, request: CutRequest): boolean {
  return (
    piece.glassTypeId === request.glassTypeId &&
    piece.widthIn >= request.widthIn &&
    piece.heightIn >= request.heightIn
  )
}

// Greedily allocates the requested quantity from the tightest-fitting pieces
// first (smallest usable area), to avoid fragmenting large pieces when a
// smaller one would already do the job.
export function suggestCutPlan(
  request: CutRequest,
  candidates: GlassPiece[]
): CutPlan {
  const usable = candidates
    .filter((piece) => fitsWithoutRotation(piece, request))
    .sort((a, b) => areaSqFt(a) - areaSqFt(b))

  const allocations: CutAllocation[] = []
  let remaining: number = request.quantity

  for (const piece of usable) {
    if (remaining <= 0) break

    const quantityToCut = quantitySchema.parse(Math.min(remaining, piece.quantity))
    allocations.push({
      piece,
      quantityToCut,
      cut: positionedRectangleSchema.parse({
        x: 0,
        y: 0,
        widthIn: request.widthIn,
        heightIn: request.heightIn,
      }),
      offcuts: guillotineSplit(piece, request),
    })
    remaining -= quantityToCut
  }

  if (remaining <= 0) {
    return {
      status: "fulfilled",
      allocations: allocations as [CutAllocation, ...CutAllocation[]],
    }
  }

  return {
    status: "partial",
    allocations,
    unfulfilledQuantity: quantitySchema.parse(remaining),
  }
}
