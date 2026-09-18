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

  // Snapshot the customer for the duration of this open session. Refreshed
  // exactly when the dialog transitions closed -> open, so a background
  // revalidation (e.g. this same dialog's own successful submit, which
  // updates `customer` moments before `onOpenChange(false)` takes effect)
  // can't change an uncontrolled input's defaultValue while it's still open.
  const initialCustomer = mode === "edit" ? props.customer : undefined
  const [customer, setCustomer] = useState(initialCustomer)
  const wasOpen = useRef(open)

  if (open && !wasOpen.current) {
    wasOpen.current = true
    if (customer !== initialCustomer) setCustomer(initialCustomer)
  } else if (!open && wasOpen.current) {
    wasOpen.current = false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          action={formAction}
          key={customer?.id ?? "new"}
          className="flex flex-col gap-4"
        >
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
                defaultValue={customer?.firstName}
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
                defaultValue={customer?.lastName}
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
                defaultValue={customer?.phoneNumber}
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
                defaultValue={customer?.address ?? ""}
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
