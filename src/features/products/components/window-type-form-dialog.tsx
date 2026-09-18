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
import type { WindowType } from "@/core/products/window-type.types"
import {
  createWindowTypeAction,
  updateWindowTypeAction,
} from "@/features/products/window-types.actions"
import {
  initialWindowTypeFormState,
  type WindowTypeFormState,
} from "@/features/products/form-state"

type WindowTypeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & ({ mode: "create" } | { mode: "edit"; windowType: WindowType })

type FormValues = {
  name: string
  laborCost: string
}

function valuesFor(windowType: WindowType | undefined): FormValues {
  return {
    name: windowType?.name ?? "",
    laborCost: windowType ? toDollarsInput(windowType.laborCost) : "",
  }
}

function asFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}

export function WindowTypeFormDialog(props: WindowTypeFormDialogProps) {
  const { open, onOpenChange, mode } = props
  const action =
    mode === "create"
      ? createWindowTypeAction
      : updateWindowTypeAction.bind(null, props.windowType.id)

  const [state, formAction, isPending] = useActionState<
    WindowTypeFormState,
    FormData
  >(action, initialWindowTypeFormState)

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  // Controlled fields, seeded fresh each time the dialog opens (not on every
  // render — see the ref-guarded block below), so a failed submit keeps
  // whatever the user typed instead of the browser's native form reset
  // wiping it back to blank.
  const windowType = mode === "edit" ? props.windowType : undefined
  const [values, setValues] = useState(() => valuesFor(windowType))
  const wasOpen = useRef(open)

  if (open && !wasOpen.current) {
    wasOpen.current = true
    setValues(valuesFor(windowType))
  } else if (!open && wasOpen.current) {
    wasOpen.current = false
  }

  function updateField<Field extends keyof FormValues>(field: Field) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add window type" : "Edit window type"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new window type."
                : "Update this window type's details."}
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
            <Field data-invalid={!!state.fieldErrors?.laborCost}>
              <FieldLabel htmlFor="laborCost">Labor cost</FieldLabel>
              <Input
                id="laborCost"
                name="laborCost"
                inputMode="decimal"
                placeholder="0.00"
                value={values.laborCost}
                onChange={updateField("laborCost")}
                aria-invalid={!!state.fieldErrors?.laborCost}
                required
              />
              <FieldError errors={asFieldErrors(state.fieldErrors?.laborCost)} />
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
              {mode === "create" ? "Add window type" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
