import type { Customer, CustomerDetails } from "@/core/customers/customer.types"

const MAX_SEARCH_RESULTS = 5

export function fullName(customer: Pick<Customer, "firstName" | "lastName">) {
  return `${customer.firstName} ${customer.lastName}`
}

export function searchCustomersByName(customers: Customer[], query: string): Customer[] {
  const needle = query.trim().toLowerCase()

  return customers
    .filter((customer) => fullName(customer).toLowerCase().includes(needle))
    .slice(0, MAX_SEARCH_RESULTS)
}

export function applyCustomerDetails(
  customer: Customer,
  details: CustomerDetails
): Customer {
  return { ...customer, ...details }
}
