import type { Customer, CustomerDetails } from "@/core/customers/customer.types"

export function fullName(customer: Pick<Customer, "firstName" | "lastName">) {
  return `${customer.firstName} ${customer.lastName}`
}

export function applyCustomerDetails(
  customer: Customer,
  details: CustomerDetails
): Customer {
  return { ...customer, ...details }
}
