"use client"

import { useActionState, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { GlassPiece } from "@/core/inventory/glass-piece.types"
import type { GlassType } from "@/core/products/glass-type.types"
import {
  registerShipmentAction,
  updateShipmentAction,
} from "@/features/inventory/actions"
import {
  initialShipmentFormState,
  type ShipmentFormState,
} from "@/features/inventory/form-state"

type ShipmentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  glassTypes: GlassType[]
} & ({ mode: "create" } | { mode: "edit"; piece: GlassPiece })

type FormValues = {
  glassTypeId: string
  widthIn: string
  heightIn: string
  quantity: string
}

function valuesFor(piece: GlassPiece | undefined): FormValues {
  return {
    glassTypeId: piece ? String(piece.glassTypeId) : "",
    widthIn: piece ? String(piece.widthIn) : "",
    heightIn: piece ? String(piece.heightIn) : "",
    quantity: piece ? String(piece.quantity) : "1",
  }
}

function asFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}

export function ShipmentFormDialog(props: ShipmentFormDialogProps) {
  const { open, onOpenChange } = props

  const [instanceKey, setInstanceKey] = useState(0)
  const wasOpen = useRef(open)

  if (open && !wasOpen.current) {
    wasOpen.current = true
    setInstanceKey((key) => key + 1)
  } else if (!open && wasOpen.current) {
    wasOpen.current = false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ShipmentForm key={instanceKey} {...props} />
      </DialogContent>
    </Dialog>
  )
}

function ShipmentForm(props: ShipmentFormDialogProps) {
  const { onOpenChange, mode, glassTypes } = props
  const action =
    mode === "create"
      ? registerShipmentAction
      : updateShipmentAction.bind(null, props.piece.id)

  const [state, formAction, isPending] = useActionState<
    ShipmentFormState,
    FormData
  >(action, initialShipmentFormState)

  useEffect(() => {
    if (state.status === "success") onOpenChange(false)
  }, [state, onOpenChange])

  const piece = mode === "edit" ? props.piece : undefined
  const [values, setValues] = useState(() => valuesFor(piece))

  function updateField<Field extends keyof FormValues>(field: Field) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? "Register shipment" : "Edit shipment"}
        </DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Add newly purchased glass stock to inventory."
            : "Update this piece's details."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.glassTypeId}>
          <FieldLabel htmlFor="glassTypeId">Glass type</FieldLabel>
          <Select
            name="glassTypeId"
            value={values.glassTypeId}
            onValueChange={(value) =>
              setValues((prev) => ({ ...prev, glassTypeId: value ?? "" }))
            }
          >
            <SelectTrigger id="glassTypeId" className="w-full">
              <SelectValue placeholder="Select a glass type">
                {(value: string | null) =>
                  glassTypes.find((g) => String(g.id) === value)?.name ??
                  "Select a glass type"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {glassTypes.map((glassType) => (
                <SelectItem key={glassType.id} value={String(glassType.id)}>
                  {glassType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={asFieldErrors(state.fieldErrors?.glassTypeId)} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field data-invalid={!!state.fieldErrors?.widthIn}>
            <FieldLabel htmlFor="widthIn">Width (in)</FieldLabel>
            <Input
              id="widthIn"
              name="widthIn"
              type="number"
              min="0.125"
              step="0.125"
              value={values.widthIn}
              onChange={updateField("widthIn")}
              aria-invalid={!!state.fieldErrors?.widthIn}
              required
            />
            <FieldError errors={asFieldErrors(state.fieldErrors?.widthIn)} />
          </Field>
          <Field data-invalid={!!state.fieldErrors?.heightIn}>
            <FieldLabel htmlFor="heightIn">Height (in)</FieldLabel>
            <Input
              id="heightIn"
              name="heightIn"
              type="number"
              min="0.125"
              step="0.125"
              value={values.heightIn}
              onChange={updateField("heightIn")}
              aria-invalid={!!state.fieldErrors?.heightIn}
              required
            />
            <FieldError errors={asFieldErrors(state.fieldErrors?.heightIn)} />
          </Field>
          <Field data-invalid={!!state.fieldErrors?.quantity}>
            <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              value={values.quantity}
              onChange={updateField("quantity")}
              aria-invalid={!!state.fieldErrors?.quantity}
              required
            />
            <FieldError errors={asFieldErrors(state.fieldErrors?.quantity)} />
          </Field>
        </div>
      </FieldGroup>
      {state.status === "error" && state.message && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {mode === "create" ? "Register shipment" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}
