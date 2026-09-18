"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlassTypeFormDialog } from "@/features/products/components/glass-type-form-dialog"

export function AddGlassTypeButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" />
        Add Glass Type
      </Button>
      <GlassTypeFormDialog mode="create" open={open} onOpenChange={setOpen} />
    </>
  )
}
