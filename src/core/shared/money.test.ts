import { describe, expect, it } from "vitest"

import {
  formatMoney,
  moneyInputSchema,
  moneySchema,
  toDollarsInput,
} from "@/core/shared/money"

describe("moneySchema", () => {
  it("accepts a non-negative integer number of cents", () => {
    expect(moneySchema.parse(0)).toBe(0)
    expect(moneySchema.parse(10500)).toBe(10500)
  })

  it("rejects negative amounts", () => {
    expect(() => moneySchema.parse(-1)).toThrow()
  })

  it("rejects non-integer amounts", () => {
    expect(() => moneySchema.parse(10.5)).toThrow()
  })
})

describe("moneyInputSchema", () => {
  it("parses a dollar string into integer cents", () => {
    expect(moneyInputSchema.parse("105")).toBe(10500)
    expect(moneyInputSchema.parse("105.5")).toBe(10550)
    expect(moneyInputSchema.parse("105.00")).toBe(10500)
  })

  it("trims surrounding whitespace", () => {
    expect(moneyInputSchema.parse("  75.25  ")).toBe(7525)
  })

  it("rejects more than two decimal places", () => {
    expect(() => moneyInputSchema.parse("1.999")).toThrow()
  })

  it("rejects negative, empty, or non-numeric input", () => {
    expect(() => moneyInputSchema.parse("-5")).toThrow()
    expect(() => moneyInputSchema.parse("")).toThrow()
    expect(() => moneyInputSchema.parse("abc")).toThrow()
  })
})

describe("toDollarsInput", () => {
  it("formats cents back into a plain decimal string", () => {
    expect(toDollarsInput(moneySchema.parse(10500))).toBe("105.00")
    expect(toDollarsInput(moneySchema.parse(0))).toBe("0.00")
    expect(toDollarsInput(moneySchema.parse(5))).toBe("0.05")
  })

  it("round-trips through moneyInputSchema", () => {
    const amount = moneyInputSchema.parse("42.30")
    expect(toDollarsInput(amount)).toBe("42.30")
  })
})

describe("formatMoney", () => {
  it("formats cents as a USD currency string", () => {
    expect(formatMoney(moneySchema.parse(10500))).toBe("$105.00")
    expect(formatMoney(moneySchema.parse(0))).toBe("$0.00")
  })
})
