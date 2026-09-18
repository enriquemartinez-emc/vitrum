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
import type { WindowType } from "@/core/products/window-type.types"
import { deleteWindowTypeAction } from "@/features/products/window-types.actions"
import { WindowTypeFormDialog } from "@/features/products/components/window-type-form-dialog"

export function WindowTypeRowActions({ windowType }: { windowType: WindowType }) {
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

      <WindowTypeFormDialog
        mode="edit"
        windowType={windowType}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete window type?"
        description={`This will permanently delete ${windowType.name}. This cannot be undone.`}
        errorMessage="Couldn't delete this window type. Please try again."
        onConfirm={() => deleteWindowTypeAction(windowType.id)}
      />
    </>
  )
}
