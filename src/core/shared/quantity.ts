import { z } from "zod"

export const quantitySchema = z.number().int().positive().brand<"Quantity">()
export type Quantity = z.infer<typeof quantitySchema>
