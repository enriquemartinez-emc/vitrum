"use server"

import { z } from "zod"

import { suggestCutPlan } from "@/core/inventory/cut-plan.rules"
import type { CutPlan } from "@/core/inventory/cut-plan.types"
import { glassTypeIdSchema } from "@/core/products/glass-type.types"
import { inchesSchema } from "@/core/shared/dimensions"
import { quantitySchema } from "@/core/shared/quantity"
import * as repository from "@/features/inventory/repository"

const cutRequestInputSchema = z.object({
  glassTypeId: glassTypeIdSchema,
  widthIn: inchesSchema,
  heightIn: inchesSchema,
  quantity: quantitySchema,
})

export async function previewCutPlanAction(input: {
  glassTypeId: number
  widthIn: number
  heightIn: number
  quantity: number
}): Promise<CutPlan> {
  const request = cutRequestInputSchema.parse(input)
  const candidates = await repository.listGlassPiecesByType(request.glassTypeId)

  return suggestCutPlan(request, candidates)
}
