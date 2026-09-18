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
import { deleteGlassTypeAction } from "@/features/products/glass-types.actions"
import { GlassTypeFormDialog } from "@/features/products/components/glass-type-form-dialog"

export function GlassTypeRowActions({ glassType }: { glassType: GlassType }) {
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

      <GlassTypeFormDialog
        mode="edit"
        glassType={glassType}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete glass type?"
        description={`This will permanently delete ${glassType.name}. This cannot be undone.`}
        errorMessage="Couldn't delete this glass type. Please try again."
        onConfirm={() => deleteGlassTypeAction(glassType.id)}
      />
    </>
  )
}
