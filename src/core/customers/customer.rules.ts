import type { Customer, CustomerDetails } from "@/core/customers/customer.types"

export function fullName(customer: Pick<Customer, "firstName" | "lastName">) {
  return `${customer.firstName} ${customer.lastName}`
}

/** Same-type edit: applies new details to an existing customer. */
export function applyCustomerDetails(
  customer: Customer,
  details: CustomerDetails
): Customer {
  return { ...customer, ...details }
}
