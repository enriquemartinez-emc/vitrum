"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CustomerFormDialog } from "@/features/customers/components/customer-form-dialog"

export function AddCustomerButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" />
        Add Customer
      </Button>
      <CustomerFormDialog mode="create" open={open} onOpenChange={setOpen} />
    </>
  )
}
