import { z } from "zod"

export const moneySchema = z.number().int().nonnegative().brand<"Money">()
export type Money = z.infer<typeof moneySchema>

export const moneyInputSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
  .transform((value) => moneySchema.parse(Math.round(Number(value) * 100)))

export function toDollarsInput(amount: Money): string {
  return (amount / 100).toFixed(2)
}

export function formatMoney(amount: Money): string {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}
