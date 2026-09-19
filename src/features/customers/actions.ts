"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { applyCustomerDetails } from "@/core/customers/customer.rules"
import {
  customerDetailsSchema,
  customerIdSchema,
  newCustomerSchema,
} from "@/core/customers/customer.types"
import type { CustomerFormState } from "@/features/customers/form-state"
import * as repository from "@/features/customers/repository"

function readCustomerForm(formData: FormData) {
  const address = formData.get("address")
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phoneNumber: formData.get("phoneNumber"),
    address:
      typeof address === "string" && address.trim() !== "" ? address : null,
  }
}

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const parsed = newCustomerSchema.safeParse(readCustomerForm(formData))

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  const customer = await repository.insertCustomer(parsed.data)
  revalidatePath("/dashboard/customers")

  return { status: "success", customer }
}

export async function updateCustomerAction(
  id: number,
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const parsed = customerDetailsSchema.safeParse(readCustomerForm(formData))

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  const customerId = customerIdSchema.parse(id)
  const existing = await repository.getCustomer(customerId)

  if (!existing) {
    return { status: "error", message: "This customer no longer exists." }
  }

  await repository.updateCustomer(applyCustomerDetails(existing, parsed.data))
  revalidatePath("/dashboard/customers")

  return { status: "success" }
}

export async function deleteCustomerAction(id: number): Promise<void> {
  await repository.deleteCustomer(customerIdSchema.parse(id))
  revalidatePath("/dashboard/customers")
}
