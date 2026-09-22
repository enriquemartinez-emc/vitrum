import { describe, expect, it } from "vitest"

import {
  applyCustomerDetails,
  fullName,
  searchCustomersByName,
} from "@/core/customers/customer.rules"
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

function makeCustomer(id: number, firstName: string, lastName: string): Customer {
  return {
    ...customer,
    id: id as Customer["id"],
    firstName: firstName as Customer["firstName"],
    lastName: lastName as Customer["lastName"],
  }
}

describe("fullName", () => {
  it("joins first and last name with a space", () => {
    expect(fullName(customer)).toBe("Jane Doe")
  })
})

describe("searchCustomersByName", () => {
  const customers = [
    makeCustomer(1, "Maria", "Gonzalez"),
    makeCustomer(2, "Mario", "Reyes"),
    makeCustomer(3, "Jane", "Doe"),
  ]

  it("matches a partial, case-insensitive substring of the full name", () => {
    expect(searchCustomersByName(customers, "gonza")).toEqual([customers[0]])
    expect(searchCustomersByName(customers, "MARIO")).toEqual([customers[1]])
  })

  it("matches across the first/last name boundary", () => {
    expect(searchCustomersByName(customers, "a gonz")).toEqual([customers[0]])
  })

  it("returns every match when the query is ambiguous", () => {
    expect(searchCustomersByName(customers, "mar")).toEqual([customers[0], customers[1]])
  })

  it("returns an empty array when nothing matches", () => {
    expect(searchCustomersByName(customers, "nonexistent")).toEqual([])
  })

  it("trims surrounding whitespace on the query", () => {
    expect(searchCustomersByName(customers, "  jane  ")).toEqual([customers[2]])
  })

  it("caps results at 5 matches", () => {
    const manyMarias = Array.from({ length: 8 }, (_, i) => makeCustomer(i + 1, "Maria", "Test"))
    expect(searchCustomersByName(manyMarias, "maria")).toHaveLength(5)
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
