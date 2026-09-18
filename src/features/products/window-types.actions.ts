"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { moneyInputSchema } from "@/core/shared/money"
import {
  windowTypeIdSchema,
  newWindowTypeSchema,
} from "@/core/products/window-type.types"
import type { WindowTypeFormState } from "@/features/products/form-state"
import * as repository from "@/features/products/window-types.repository"
import { isUniqueViolation } from "@/lib/db/errors"

const DUPLICATE_NAME_ERROR: WindowTypeFormState = {
  status: "error",
  message: "Check the highlighted fields.",
  fieldErrors: { name: ["A window type with this name already exists."] },
}

function readWindowTypeForm(formData: FormData) {
  return {
    name: formData.get("name"),
    laborCost: formData.get("laborCost"),
  }
}

const windowTypeFormSchema = newWindowTypeSchema.extend({
  laborCost: moneyInputSchema,
})

export async function createWindowTypeAction(
  _prevState: WindowTypeFormState,
  formData: FormData
): Promise<WindowTypeFormState> {
  const parsed = windowTypeFormSchema.safeParse(readWindowTypeForm(formData))

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  try {
    await repository.insertWindowType(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) return DUPLICATE_NAME_ERROR
    throw error
  }

  revalidatePath("/dashboard/products/window-types")

  return { status: "success" }
}

export async function updateWindowTypeAction(
  id: number,
  _prevState: WindowTypeFormState,
  formData: FormData
): Promise<WindowTypeFormState> {
  const parsed = windowTypeFormSchema.safeParse(readWindowTypeForm(formData))

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  const windowTypeId = windowTypeIdSchema.parse(id)
  const existing = await repository.getWindowType(windowTypeId)

  if (!existing) {
    return { status: "error", message: "This window type no longer exists." }
  }

  try {
    await repository.updateWindowType({ ...existing, ...parsed.data })
  } catch (error) {
    if (isUniqueViolation(error)) return DUPLICATE_NAME_ERROR
    throw error
  }

  revalidatePath("/dashboard/products/window-types")

  return { status: "success" }
}

export async function deleteWindowTypeAction(id: number): Promise<void> {
  await repository.deleteWindowType(windowTypeIdSchema.parse(id))
  revalidatePath("/dashboard/products/window-types")
}
