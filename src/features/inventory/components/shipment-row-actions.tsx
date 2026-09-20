"use client"

import { useState } from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GlassType } from "@/core/products/glass-type.types"
import { deleteShipmentAction } from "@/features/inventory/actions"
import { ShipmentFormDialog } from "@/features/inventory/components/shipment-form-dialog"
import type { GlassPieceSummary } from "@/features/inventory/repository"

export function ShipmentRowActions({
  piece,
  glassTypes,
}: {
  piece: GlassPieceSummary
  glassTypes: GlassType[]
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="size-8" />}
        >
          <MoreHorizontalIcon />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShipmentFormDialog
        mode="edit"
        piece={piece}
        glassTypes={glassTypes}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this piece?"
        description={`This will permanently remove this ${piece.widthIn}×${piece.heightIn}in ${piece.glassTypeName} piece (qty ${piece.quantity}) from inventory. This cannot be undone.`}
        errorMessage="Couldn't delete this piece. Please try again."
        onConfirm={() => deleteShipmentAction(piece.id)}
      />
    </>
  )
}
