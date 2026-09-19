export type QuoteFormState = {
  status: "idle" | "error" | "success"
  message?: string
}

export const initialQuoteFormState: QuoteFormState = { status: "idle" }
