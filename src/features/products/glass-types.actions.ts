"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { moneyInputSchema } from "@/core/shared/money"
import {
  glassTypeIdSchema,
  newGlassTypeSchema,
} from "@/core/products/glass-type.types"
import type { GlassTypeFormState } from "@/features/products/form-state"
import * as repository from "@/features/products/glass-types.repository"
import { isUniqueViolation } from "@/lib/db/errors"

const DUPLICATE_NAME_ERROR: GlassTypeFormState = {
  status: "error",
  message: "Check the highlighted fields.",
  fieldErrors: { name: ["A glass type with this name already exists."] },
}

function readGlassTypeForm(formData: FormData) {
  return {
    name: formData.get("name"),
    pricePerSqFt: formData.get("pricePerSqFt"),
  }
}

const glassTypeFormSchema = newGlassTypeSchema.extend({
  pricePerSqFt: moneyInputSchema,
})

export async function createGlassTypeAction(
  _prevState: GlassTypeFormState,
  formData: FormData
): Promise<GlassTypeFormState> {
  const parsed = glassTypeFormSchema.safeParse(readGlassTypeForm(formData))

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  try {
    await repository.insertGlassType(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) return DUPLICATE_NAME_ERROR
    throw error
  }

  revalidatePath("/dashboard/products/glass-types")

  return { status: "success" }
}

export async function updateGlassTypeAction(
  id: number,
  _prevState: GlassTypeFormState,
  formData: FormData
): Promise<GlassTypeFormState> {
  const parsed = glassTypeFormSchema.safeParse(readGlassTypeForm(formData))

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  const glassTypeId = glassTypeIdSchema.parse(id)
  const existing = await repository.getGlassType(glassTypeId)

  if (!existing) {
    return { status: "error", message: "This glass type no longer exists." }
  }

  try {
    await repository.updateGlassType({ ...existing, ...parsed.data })
  } catch (error) {
    if (isUniqueViolation(error)) return DUPLICATE_NAME_ERROR
    throw error
  }

  revalidatePath("/dashboard/products/glass-types")

  return { status: "success" }
}

export async function deleteGlassTypeAction(id: number): Promise<void> {
  await repository.deleteGlassType(glassTypeIdSchema.parse(id))
  revalidatePath("/dashboard/products/glass-types")
}
