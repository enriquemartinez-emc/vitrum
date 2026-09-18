import { describe, expect, it } from "vitest"

import { moneyInputSchema } from "@/core/shared/money"
import {
  newWindowTypeSchema,
  windowTypeSchema,
} from "@/core/products/window-type.types"

describe("newWindowTypeSchema", () => {
  it("accepts a name and a non-negative labor cost", () => {
    const result = newWindowTypeSchema.parse({
      name: "Awning",
      laborCost: moneyInputSchema.parse("105.00"),
    })
    expect(result.name).toBe("Awning")
    expect(result.laborCost).toBe(10500)
  })

  it("rejects an empty name", () => {
    expect(() =>
      newWindowTypeSchema.parse({ name: "", laborCost: 10500 })
    ).toThrow()
  })

  it("rejects a negative labor cost", () => {
    expect(() =>
      newWindowTypeSchema.parse({ name: "Awning", laborCost: -1 })
    ).toThrow()
  })
})

describe("windowTypeSchema", () => {
  it("parses a full window type record", () => {
    const result = windowTypeSchema.parse({
      id: 1,
      name: "Awning",
      laborCost: 10500,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    })
    expect(result.name).toBe("Awning")
  })

  it("rejects a non-positive id", () => {
    expect(() =>
      windowTypeSchema.parse({
        id: 0,
        name: "Awning",
        laborCost: 10500,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow()
  })
})
