export type FormState<Field extends string> = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: Partial<Record<Field, string[]>>
}

export type WindowTypeField = "name" | "laborCost"
export type WindowTypeFormState = FormState<WindowTypeField>
export const initialWindowTypeFormState: WindowTypeFormState = { status: "idle" }

export type GlassTypeField = "name" | "pricePerSqFt"
export type GlassTypeFormState = FormState<GlassTypeField>
export const initialGlassTypeFormState: GlassTypeFormState = { status: "idle" }
