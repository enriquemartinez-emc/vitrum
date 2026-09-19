import type { Customer } from "@/core/customers/customer.types"

export type CustomerFieldErrors = Partial<
  Record<"firstName" | "lastName" | "phoneNumber" | "address", string[]>
>

export type CustomerFormState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: CustomerFieldErrors
  customer?: Customer
}

export const initialCustomerFormState: CustomerFormState = { status: "idle" }
