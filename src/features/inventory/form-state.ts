export type ShipmentFieldErrors = Partial<
  Record<"glassTypeId" | "widthIn" | "heightIn" | "quantity", string[]>
>

export type ShipmentFormState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: ShipmentFieldErrors
}

export const initialShipmentFormState: ShipmentFormState = { status: "idle" }
