"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { GlassType } from "@/core/products/glass-type.types"
import { RegisterShipmentDialog } from "@/features/inventory/components/register-shipment-dialog"

export function RegisterShipmentButton({ glassTypes }: { glassTypes: GlassType[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" />
        Register shipment
      </Button>
      <RegisterShipmentDialog open={open} onOpenChange={setOpen} glassTypes={glassTypes} />
    </>
  )
}
