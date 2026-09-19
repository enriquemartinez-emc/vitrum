import { z } from "zod"

import { inchesSchema } from "@/core/shared/dimensions"
import { quantitySchema } from "@/core/shared/quantity"
import { glassTypeIdSchema } from "@/core/products/glass-type.types"

export const glassPieceIdSchema = z.number().int().positive().brand<"GlassPieceId">()
export type GlassPieceId = z.infer<typeof glassPieceIdSchema>

export const pieceOriginSchema = z.enum(["shipment", "offcut"])
export type PieceOrigin = z.infer<typeof pieceOriginSchema>

export const glassPieceSchema = z.object({
  id: glassPieceIdSchema,
  glassTypeId: glassTypeIdSchema,
  widthIn: inchesSchema,
  heightIn: inchesSchema,
  quantity: quantitySchema,
  origin: pieceOriginSchema,
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})
export type GlassPiece = z.infer<typeof glassPieceSchema>

export const newGlassPieceSchema = z.object({
  glassTypeId: glassTypeIdSchema,
  widthIn: inchesSchema,
  heightIn: inchesSchema,
  quantity: quantitySchema,
  origin: pieceOriginSchema,
})
export type NewGlassPiece = z.infer<typeof newGlassPieceSchema>
