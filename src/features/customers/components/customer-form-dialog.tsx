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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { Customer } from "@/core/customers/customer.types"
import { createCustomerAction, updateCustomerAction } from "@/features/customers/actions"
import {
  initialCustomerFormState,
  type CustomerFormState,
} from "@/features/customers/form-state"

type CustomerFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & ({ mode: "create" } | { mode: "edit"; customer: Customer })

type FormValues = {
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
}

function valuesFor(customer: Customer | undefined): FormValues {
  return {
    firstName: customer?.firstName ?? "",
    lastName: customer?.lastName ?? "",
    phoneNumber: customer?.phoneNumber ?? "",
    address: customer?.address ?? "",
  }
}

function asFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}

export function CustomerFormDialog(props: CustomerFormDialogProps) {
  const { open, onOpenChange, mode } = props
  const action =
    mode === "create"
      ? createCustomerAction
      : updateCustomerAction.bind(null, props.customer.id)

  const [state, formAction, isPending] = useActionState<
    CustomerFormState,
    FormData
  >(action, initialCustomerFormState)

  useEffect(() => {
    if (state.status === "success") {
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  // Controlled fields, seeded fresh each time the dialog opens (not on every
  // render — see the ref-guarded block below), so a failed submit keeps
  // whatever the user typed instead of the browser's native form reset
  // wiping it back to blank.
  const customer = mode === "edit" ? props.customer : undefined
  const [values, setValues] = useState(() => valuesFor(customer))
  const wasOpen = useRef(open)

  if (open && !wasOpen.current) {
    wasOpen.current = true
    setValues(valuesFor(customer))
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
              {mode === "create" ? "Add customer" : "Edit customer"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new customer record."
                : "Update this customer's details."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.firstName}>
              <FieldLabel htmlFor="firstName">First name</FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                value={values.firstName}
                onChange={updateField("firstName")}
                aria-invalid={!!state.fieldErrors?.firstName}
                required
              />
              <FieldError errors={asFieldErrors(state.fieldErrors?.firstName)} />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.lastName}>
              <FieldLabel htmlFor="lastName">Last name</FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                value={values.lastName}
                onChange={updateField("lastName")}
                aria-invalid={!!state.fieldErrors?.lastName}
                required
              />
              <FieldError errors={asFieldErrors(state.fieldErrors?.lastName)} />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.phoneNumber}>
              <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={values.phoneNumber}
                onChange={updateField("phoneNumber")}
                aria-invalid={!!state.fieldErrors?.phoneNumber}
                required
              />
              <FieldError
                errors={asFieldErrors(state.fieldErrors?.phoneNumber)}
              />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.address}>
              <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
              <Input
                id="address"
                name="address"
                value={values.address}
                onChange={updateField("address")}
                aria-invalid={!!state.fieldErrors?.address}
              />
              <FieldError errors={asFieldErrors(state.fieldErrors?.address)} />
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
              {mode === "create" ? "Add customer" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
