import { z } from "zod"

const trimmedNonEmpty = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .max(max, `Must be ${max} characters or fewer`)

export const customerIdSchema = z.number().int().positive().brand<"CustomerId">()
export type CustomerId = z.infer<typeof customerIdSchema>

export const customerNameSchema = trimmedNonEmpty(100).brand<"CustomerName">()
export type CustomerName = z.infer<typeof customerNameSchema>

export const phoneNumberSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^[+0-9()\-.\s]+$/, "Enter a valid phone number")
  .brand<"PhoneNumber">()
export type PhoneNumber = z.infer<typeof phoneNumberSchema>

export const addressSchema = trimmedNonEmpty(200).brand<"Address">()
export type Address = z.infer<typeof addressSchema>

export const customerSchema = z.object({
  id: customerIdSchema,
  firstName: customerNameSchema,
  lastName: customerNameSchema,
  phoneNumber: phoneNumberSchema,
  address: addressSchema.nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})
export type Customer = z.infer<typeof customerSchema>

export const newCustomerSchema = z.object({
  firstName: customerNameSchema,
  lastName: customerNameSchema,
  phoneNumber: phoneNumberSchema,
  address: addressSchema.nullable(),
})
export type NewCustomer = z.infer<typeof newCustomerSchema>

export const customerDetailsSchema = newCustomerSchema
export type CustomerDetails = z.infer<typeof customerDetailsSchema>
