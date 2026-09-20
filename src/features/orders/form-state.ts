export type OrderFormState = {
  status: "idle" | "error" | "success"
  message?: string
}

export const initialOrderFormState: OrderFormState = { status: "idle" }
