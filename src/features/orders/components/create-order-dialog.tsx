"use client"

import { useActionState, useEffect, useRef, useState } from "react"

import { DatePickerField } from "@/components/date-picker-field"
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
import { createOrderAction } from "@/features/orders/actions"
import {
  initialOrderFormState,
  type OrderFormState,
} from "@/features/orders/form-state"

type CreateOrderDialogProps = {
  quoteId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateOrderDialog(props: CreateOrderDialogProps) {
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
        <CreateOrderForm key={instanceKey} {...props} />
      </DialogContent>
    </Dialog>
  )
}

function CreateOrderForm({ quoteId, onOpenChange, onCreated }: CreateOrderDialogProps) {
  const [state, formAction, isPending] = useActionState<OrderFormState, FormData>(
    createOrderAction,
    initialOrderFormState
  )

  useEffect(() => {
    if (state.status === "success") {
      onCreated?.()
      onOpenChange(false)
    }
  }, [state, onOpenChange, onCreated])

  const [installationDate, setInstallationDate] = useState<Date>()

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="quoteId" value={quoteId} />
      <DialogHeader>
        <DialogTitle>Schedule installation</DialogTitle>
        <DialogDescription>
          Set an installation date to schedule the order for this quote.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field data-invalid={state.status === "error"}>
          <FieldLabel htmlFor="installationDate">Installation date</FieldLabel>
          <DatePickerField
            id="installationDate"
            name="installationDate"
            value={installationDate}
            onChange={setInstallationDate}
            ariaInvalid={state.status === "error"}
          />
          <FieldError
            errors={
              state.status === "error" && state.message
                ? [{ message: state.message }]
                : undefined
            }
          />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isPending || !installationDate}>
          Confirm
        </Button>
      </DialogFooter>
    </form>
  )
}
