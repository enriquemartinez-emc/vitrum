import type { PositionedRectangle, Rectangle } from "@/core/shared/dimensions"
import type { Quantity } from "@/core/shared/quantity"
import type { GlassPiece } from "@/core/inventory/glass-piece.types"
import type { GlassTypeId } from "@/core/products/glass-type.types"

export type CutRequest = {
  glassTypeId: GlassTypeId
  widthIn: Rectangle["widthIn"]
  heightIn: Rectangle["heightIn"]
  quantity: Quantity
}

export type CutAllocation = {
  piece: GlassPiece
  quantityToCut: Quantity
  // Both positioned within the piece, origin at its bottom-left corner, so a
  // caller can render an accurate diagram of the cut without re-deriving it.
  cut: PositionedRectangle
  offcuts: PositionedRectangle[]
}

export type FulfilledCutPlan = {
  status: "fulfilled"
  allocations: [CutAllocation, ...CutAllocation[]]
}

export type PartialCutPlan = {
  status: "partial"
  allocations: CutAllocation[]
  unfulfilledQuantity: Quantity
}

export type CutPlan = FulfilledCutPlan | PartialCutPlan
