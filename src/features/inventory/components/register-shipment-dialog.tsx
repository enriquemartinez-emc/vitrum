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
import type { GlassType } from "@/core/products/glass-type.types"
import { registerShipmentAction } from "@/features/inventory/actions"
import {
  initialShipmentFormState,
  type ShipmentFormState,
} from "@/features/inventory/form-state"

type RegisterShipmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  glassTypes: GlassType[]
}

function asFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}

export function RegisterShipmentDialog(props: RegisterShipmentDialogProps) {
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
        <RegisterShipmentForm key={instanceKey} {...props} />
      </DialogContent>
    </Dialog>
  )
}

function RegisterShipmentForm({ onOpenChange, glassTypes }: RegisterShipmentDialogProps) {
  const [state, formAction, isPending] = useActionState<ShipmentFormState, FormData>(
    registerShipmentAction,
    initialShipmentFormState
  )

  useEffect(() => {
    if (state.status === "success") onOpenChange(false)
  }, [state, onOpenChange])

  const [glassTypeId, setGlassTypeId] = useState("")
  const [widthIn, setWidthIn] = useState("")
  const [heightIn, setHeightIn] = useState("")
  const [quantity, setQuantity] = useState("1")

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Register shipment</DialogTitle>
        <DialogDescription>
          Add newly purchased glass stock to inventory.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.glassTypeId}>
          <FieldLabel htmlFor="glassTypeId">Glass type</FieldLabel>
          <Select
            name="glassTypeId"
            value={glassTypeId}
            onValueChange={(value) => setGlassTypeId(value ?? "")}
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
              value={widthIn}
              onChange={(event) => setWidthIn(event.target.value)}
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
              value={heightIn}
              onChange={(event) => setHeightIn(event.target.value)}
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
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
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
          Register shipment
        </Button>
      </DialogFooter>
    </form>
  )
}
