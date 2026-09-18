import { describe, expect, it } from "vitest"

import { moneyInputSchema } from "@/core/shared/money"
import {
  glassTypeSchema,
  newGlassTypeSchema,
} from "@/core/products/glass-type.types"

describe("newGlassTypeSchema", () => {
  it("accepts a name and a non-negative price per sq ft", () => {
    const result = newGlassTypeSchema.parse({
      name: "Tempered",
      pricePerSqFt: moneyInputSchema.parse("12.50"),
    })
    expect(result.name).toBe("Tempered")
    expect(result.pricePerSqFt).toBe(1250)
  })

  it("rejects an empty name", () => {
    expect(() =>
      newGlassTypeSchema.parse({ name: "", pricePerSqFt: 1250 })
    ).toThrow()
  })

  it("rejects a negative price", () => {
    expect(() =>
      newGlassTypeSchema.parse({ name: "Tempered", pricePerSqFt: -1 })
    ).toThrow()
  })
})

describe("glassTypeSchema", () => {
  it("parses a full glass type record", () => {
    const result = glassTypeSchema.parse({
      id: 1,
      name: "Tempered",
      pricePerSqFt: 1250,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    })
    expect(result.name).toBe("Tempered")
  })

  it("rejects a non-positive id", () => {
    expect(() =>
      glassTypeSchema.parse({
        id: 0,
        name: "Tempered",
        pricePerSqFt: 1250,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow()
  })
})
