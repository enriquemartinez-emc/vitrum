"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { WindowTypeFormDialog } from "@/features/products/components/window-type-form-dialog"

export function AddWindowTypeButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" />
        Add Window Type
      </Button>
      <WindowTypeFormDialog mode="create" open={open} onOpenChange={setOpen} />
    </>
  )
}
