"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { suggestCutPlan } from "@/core/inventory/cut-plan.rules"
import type { CutPlan } from "@/core/inventory/cut-plan.types"
import { glassTypeIdSchema } from "@/core/products/glass-type.types"
import { inchesSchema } from "@/core/shared/dimensions"
import { quantitySchema } from "@/core/shared/quantity"
import * as repository from "@/features/inventory/repository"
import type { ShipmentFormState } from "@/features/inventory/form-state"

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

const registerShipmentInputSchema = z.object({
  glassTypeId: z.coerce
    .number()
    .int()
    .positive()
    .transform((value) => glassTypeIdSchema.parse(value)),
  widthIn: z.coerce
    .number()
    .positive()
    .transform((value) => inchesSchema.parse(value)),
  heightIn: z.coerce
    .number()
    .positive()
    .transform((value) => inchesSchema.parse(value)),
  quantity: z.coerce
    .number()
    .int()
    .positive()
    .transform((value) => quantitySchema.parse(value)),
})

function readShipmentForm(formData: FormData) {
  return {
    glassTypeId: formData.get("glassTypeId"),
    widthIn: formData.get("widthIn"),
    heightIn: formData.get("heightIn"),
    quantity: formData.get("quantity"),
  }
}

export async function registerShipmentAction(
  _prevState: ShipmentFormState,
  formData: FormData
): Promise<ShipmentFormState> {
  const parsed = registerShipmentInputSchema.safeParse(readShipmentForm(formData))

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  await repository.insertGlassPiece({ ...parsed.data, origin: "shipment" })

  revalidatePath("/dashboard/inventory")

  return { status: "success" }
}
