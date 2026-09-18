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
import { toDollarsInput } from "@/core/shared/money"
import type { GlassType } from "@/core/products/glass-type.types"
import {
  createGlassTypeAction,
  updateGlassTypeAction,
} from "@/features/products/glass-types.actions"
import {
  initialGlassTypeFormState,
  type GlassTypeFormState,
} from "@/features/products/form-state"

type GlassTypeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & ({ mode: "create" } | { mode: "edit"; glassType: GlassType })

function asFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}

export function GlassTypeFormDialog(props: GlassTypeFormDialogProps) {
  const { open, onOpenChange, mode } = props
  const action =
    mode === "create"
      ? createGlassTypeAction
      : updateGlassTypeAction.bind(null, props.glassType.id)

  const [state, formAction, isPending] = useActionState<
    GlassTypeFormState,
    FormData
  >(action, initialGlassTypeFormState)

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  const initialGlassType = mode === "edit" ? props.glassType : undefined
  const [glassType, setGlassType] = useState(initialGlassType)
  const wasOpen = useRef(open)

  if (open && !wasOpen.current) {
    wasOpen.current = true
    if (glassType !== initialGlassType) setGlassType(initialGlassType)
  } else if (!open && wasOpen.current) {
    wasOpen.current = false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          action={formAction}
          key={glassType?.id ?? "new"}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add glass type" : "Edit glass type"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new glass type."
                : "Update this glass type's details."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={glassType?.name}
                aria-invalid={!!state.fieldErrors?.name}
                required
              />
              <FieldError errors={asFieldErrors(state.fieldErrors?.name)} />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.pricePerSqFt}>
              <FieldLabel htmlFor="pricePerSqFt">Price per sq ft</FieldLabel>
              <Input
                id="pricePerSqFt"
                name="pricePerSqFt"
                inputMode="decimal"
                placeholder="0.00"
                defaultValue={
                  glassType ? toDollarsInput(glassType.pricePerSqFt) : ""
                }
                aria-invalid={!!state.fieldErrors?.pricePerSqFt}
                required
              />
              <FieldError
                errors={asFieldErrors(state.fieldErrors?.pricePerSqFt)}
              />
            </Field>
          </FieldGroup>
          {state.status === "error" && state.message && !state.fieldErrors && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {mode === "create" ? "Add glass type" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
