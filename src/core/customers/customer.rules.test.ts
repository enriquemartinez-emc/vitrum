import { describe, expect, it } from "vitest"

import { applyCustomerDetails, fullName } from "@/core/customers/customer.rules"
import type { Customer, CustomerDetails } from "@/core/customers/customer.types"

const customer: Customer = {
  id: 1 as Customer["id"],
  firstName: "Jane" as Customer["firstName"],
  lastName: "Doe" as Customer["lastName"],
  phoneNumber: "555-123-4567" as Customer["phoneNumber"],
  address: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
}

describe("fullName", () => {
  it("joins first and last name with a space", () => {
    expect(fullName(customer)).toBe("Jane Doe")
  })
})

describe("applyCustomerDetails", () => {
  it("overwrites only the fields present in details, keeping the id and timestamps", () => {
    const details: CustomerDetails = {
      firstName: "Janet" as CustomerDetails["firstName"],
      lastName: customer.lastName,
      phoneNumber: customer.phoneNumber,
      address: "456 Oak Ave" as CustomerDetails["address"],
    }

    const updated = applyCustomerDetails(customer, details)

    expect(updated).toEqual({
      ...customer,
      firstName: "Janet",
      address: "456 Oak Ave",
    })
  })

  it("does not mutate the original customer", () => {
    const details: CustomerDetails = {
      firstName: "Janet" as CustomerDetails["firstName"],
      lastName: customer.lastName,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
    }

    applyCustomerDetails(customer, details)

    expect(customer.firstName).toBe("Jane")
  })
})
