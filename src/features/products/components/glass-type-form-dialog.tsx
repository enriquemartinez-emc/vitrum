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

type FormValues = {
  name: string
  pricePerSqFt: string
}

function valuesFor(glassType: GlassType | undefined): FormValues {
  return {
    name: glassType?.name ?? "",
    pricePerSqFt: glassType ? toDollarsInput(glassType.pricePerSqFt) : "",
  }
}

function asFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}

export function GlassTypeFormDialog(props: GlassTypeFormDialogProps) {
  const { open, onOpenChange } = props

  // Remount the form (including its useActionState) fresh every time the
  // dialog opens, so a stale validation error from a previous attempt can't
  // reappear on reopen, and controlled fields always start from the current
  // entity instead of whatever was last typed.
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
        <GlassTypeForm key={instanceKey} {...props} />
      </DialogContent>
    </Dialog>
  )
}

function GlassTypeForm(props: GlassTypeFormDialogProps) {
  const { onOpenChange, mode } = props
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

  const glassType = mode === "edit" ? props.glassType : undefined
  const [values, setValues] = useState(() => valuesFor(glassType))

  function updateField<Field extends keyof FormValues>(field: Field) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
            value={values.name}
            onChange={updateField("name")}
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
            value={values.pricePerSqFt}
            onChange={updateField("pricePerSqFt")}
            aria-invalid={!!state.fieldErrors?.pricePerSqFt}
            required
          />
          <FieldError errors={asFieldErrors(state.fieldErrors?.pricePerSqFt)} />
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
  )
}
