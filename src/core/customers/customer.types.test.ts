import { describe, expect, it } from "vitest"

import {
  addressSchema,
  customerNameSchema,
  customerSchema,
  newCustomerSchema,
  phoneNumberSchema,
} from "@/core/customers/customer.types"

describe("customerNameSchema", () => {
  it("accepts a non-empty name", () => {
    expect(customerNameSchema.parse("Jane")).toBe("Jane")
  })

  it("trims surrounding whitespace", () => {
    expect(customerNameSchema.parse("  Jane  ")).toBe("Jane")
  })

  it("rejects an empty or whitespace-only name", () => {
    expect(() => customerNameSchema.parse("")).toThrow()
    expect(() => customerNameSchema.parse("   ")).toThrow()
  })

  it("rejects a name over 100 characters", () => {
    expect(() => customerNameSchema.parse("a".repeat(101))).toThrow()
  })
})

describe("phoneNumberSchema", () => {
  it("accepts common phone formats", () => {
    expect(phoneNumberSchema.parse("555-123-4567")).toBe("555-123-4567")
    expect(phoneNumberSchema.parse("+1 (555) 123 4567")).toBe(
      "+1 (555) 123 4567"
    )
  })

  it("rejects letters or other invalid characters", () => {
    expect(() => phoneNumberSchema.parse("555-CALL-NOW")).toThrow()
  })

  it("rejects numbers that are too short or too long", () => {
    expect(() => phoneNumberSchema.parse("12345")).toThrow()
    expect(() => phoneNumberSchema.parse("1".repeat(21))).toThrow()
  })
})

describe("addressSchema", () => {
  it("accepts a non-empty address", () => {
    expect(addressSchema.parse("123 Main St")).toBe("123 Main St")
  })

  it("rejects an empty address", () => {
    expect(() => addressSchema.parse("")).toThrow()
  })
})

describe("newCustomerSchema", () => {
  it("accepts a null address since address is optional", () => {
    const result = newCustomerSchema.parse({
      firstName: "Jane",
      lastName: "Doe",
      phoneNumber: "555-123-4567",
      address: null,
    })
    expect(result.address).toBeNull()
  })

  it("rejects a missing required field", () => {
    expect(() =>
      newCustomerSchema.parse({
        firstName: "Jane",
        phoneNumber: "555-123-4567",
        address: null,
      })
    ).toThrow()
  })
})

describe("customerSchema", () => {
  it("parses a full customer record", () => {
    const result = customerSchema.parse({
      id: 1,
      firstName: "Jane",
      lastName: "Doe",
      phoneNumber: "555-123-4567",
      address: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    })
    expect(result.firstName).toBe("Jane")
  })

  it("rejects a non-positive id", () => {
    expect(() =>
      customerSchema.parse({
        id: 0,
        firstName: "Jane",
        lastName: "Doe",
        phoneNumber: "555-123-4567",
        address: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow()
  })
})
