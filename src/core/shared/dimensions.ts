import { z } from "zod"

export const inchesSchema = z.number().positive().brand<"Inches">()
export type Inches = z.infer<typeof inchesSchema>

export const rectangleSchema = z.object({
  widthIn: inchesSchema,
  heightIn: inchesSchema,
})
export type Rectangle = z.infer<typeof rectangleSchema>

const SQ_IN_PER_SQ_FT = 144

export function areaSqFt(rectangle: Rectangle): number {
  return (rectangle.widthIn * rectangle.heightIn) / SQ_IN_PER_SQ_FT
}
