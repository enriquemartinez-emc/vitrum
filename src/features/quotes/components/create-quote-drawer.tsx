"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { AlertTriangleIcon, ChevronDownIcon, CircleCheckIcon, PlusIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { CutPlan } from "@/core/inventory/cut-plan.types"
import type { Customer } from "@/core/customers/customer.types"
import type { GlassType } from "@/core/products/glass-type.types"
import type { WindowType } from "@/core/products/window-type.types"
import { priceLineItem } from "@/core/quotes/quote.rules"
import { inchesSchema } from "@/core/shared/dimensions"
import { formatMoney } from "@/core/shared/money"
import { quantitySchema } from "@/core/shared/quantity"
import { previewCutPlanAction } from "@/features/inventory/actions"
import { createQuoteAction } from "@/features/quotes/actions"
import { CustomerCombobox } from "@/features/quotes/components/customer-combobox"
import { initialQuoteFormState, type QuoteFormState } from "@/features/quotes/form-state"

type CreateQuoteDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: Customer[]
  windowTypes: WindowType[]
  glassTypes: GlassType[]
}

type DraftLineItem = {
  key: string
  windowTypeId: string
  glassTypeId: string
  widthIn: string
  heightIn: string
  quantity: string
  cutPlan: CutPlan | null
  isChecking: boolean
  checkError: string | null
}

function emptyLineItem(key: string): DraftLineItem {
  return {
    key,
    windowTypeId: "",
    glassTypeId: "",
    widthIn: "",
    heightIn: "",
    quantity: "1",
    cutPlan: null,
    isChecking: false,
    checkError: null,
  }
}

export function CreateQuoteDrawer(props: CreateQuoteDrawerProps) {
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
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="[--drawer-content-width:100dvw]! sm:[--drawer-content-width:30rem]!">
        <CreateQuoteForm key={instanceKey} {...props} />
      </DrawerContent>
    </Drawer>
  )
}

function CreateQuoteForm({
  onOpenChange,
  customers,
  windowTypes,
  glassTypes,
}: CreateQuoteDrawerProps) {
  const [state, formAction, isPending] = useActionState<QuoteFormState, FormData>(
    createQuoteAction,
    initialQuoteFormState
  )

  useEffect(() => {
    if (state.status === "success") onOpenChange(false)
  }, [state, onOpenChange])

  const [customerList, setCustomerList] = useState(customers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [lineItems, setLineItems] = useState<DraftLineItem[]>(() => [
    emptyLineItem(crypto.randomUUID()),
  ])

  function updateLineItem(key: string, patch: Partial<DraftLineItem>) {
    setLineItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, emptyLineItem(crypto.randomUUID())])
  }

  function removeLineItem(key: string) {
    setLineItems((prev) =>
      prev.length > 1 ? prev.filter((item) => item.key !== key) : prev
    )
  }

  async function checkAvailability(item: DraftLineItem) {
    const glassTypeId = Number(item.glassTypeId)
    const widthIn = Number(item.widthIn)
    const heightIn = Number(item.heightIn)
    const quantity = Number(item.quantity)

    updateLineItem(item.key, { isChecking: true, checkError: null })

    try {
      const plan = await previewCutPlanAction({
        glassTypeId,
        widthIn,
        heightIn,
        quantity,
      })
      updateLineItem(item.key, { cutPlan: plan, isChecking: false })
    } catch {
      updateLineItem(item.key, {
        isChecking: false,
        checkError: "Couldn't check glass availability. Try again in a moment.",
      })
    }
  }

  const serializedLineItems = JSON.stringify(
    lineItems
      .filter(
        (item) =>
          item.windowTypeId && item.glassTypeId && item.widthIn && item.heightIn && item.quantity
      )
      .map((item) => ({
        windowTypeId: Number(item.windowTypeId),
        glassTypeId: Number(item.glassTypeId),
        widthIn: Number(item.widthIn),
        heightIn: Number(item.heightIn),
        quantity: Number(item.quantity),
      }))
  )

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader>
        <DrawerTitle>New quote</DrawerTitle>
        <DrawerDescription>
          Price a set of windows for a customer and see what glass is on hand.
        </DrawerDescription>
      </DrawerHeader>

      <input
        type="hidden"
        name="customerId"
        value={selectedCustomer?.id ?? ""}
      />
      <input type="hidden" name="lineItems" value={serializedLineItems} />

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
        <Field>
          <FieldLabel>Customer</FieldLabel>
          <CustomerCombobox
            customers={customerList}
            value={selectedCustomer}
            onValueChange={setSelectedCustomer}
            onCustomerCreated={(customer) =>
              setCustomerList((prev) => [...prev, customer])
            }
          />
        </Field>

        <div className="flex flex-col gap-4">
          {lineItems.map((item, index) => (
            <LineItemRow
              key={item.key}
              index={index}
              item={item}
              windowTypes={windowTypes}
              glassTypes={glassTypes}
              canRemove={lineItems.length > 1}
              onChange={(patch) => updateLineItem(item.key, patch)}
              onRemove={() => removeLineItem(item.key)}
              onCheckAvailability={() => checkAvailability(item)}
            />
          ))}
          <Button type="button" variant="outline" onClick={addLineItem}>
            <PlusIcon data-icon="inline-start" />
            Add line item
          </Button>
        </div>

        {state.status === "error" && state.message && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}
      </div>

      <DrawerFooter>
        <DrawerClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DrawerClose>
        <Button type="submit" disabled={isPending}>
          Create quote
        </Button>
      </DrawerFooter>
    </form>
  )
}

function parsePreviewPrice(
  item: DraftLineItem,
  windowTypes: WindowType[],
  glassTypes: GlassType[]
) {
  const windowType = windowTypes.find((w) => String(w.id) === item.windowTypeId)
  const glassType = glassTypes.find((g) => String(g.id) === item.glassTypeId)
  if (!windowType || !glassType) return null

  const width = inchesSchema.safeParse(Number(item.widthIn))
  const height = inchesSchema.safeParse(Number(item.heightIn))
  const quantity = quantitySchema.safeParse(Number(item.quantity))
  if (!width.success || !height.success || !quantity.success) return null

  return priceLineItem(
    { widthIn: width.data, heightIn: height.data, quantity: quantity.data },
    windowType,
    glassType
  )
}

function canCheckAvailability(item: DraftLineItem) {
  return (
    item.glassTypeId !== "" &&
    Number(item.widthIn) > 0 &&
    Number(item.heightIn) > 0 &&
    Number(item.quantity) > 0
  )
}

function LineItemRow({
  index,
  item,
  windowTypes,
  glassTypes,
  canRemove,
  onChange,
  onRemove,
  onCheckAvailability,
}: {
  index: number
  item: DraftLineItem
  windowTypes: WindowType[]
  glassTypes: GlassType[]
  canRemove: boolean
  onChange: (patch: Partial<DraftLineItem>) => void
  onRemove: () => void
  onCheckAvailability: () => void
}) {
  const price = parsePreviewPrice(item, windowTypes, glassTypes)
  const glassTypeName = glassTypes.find((g) => String(g.id) === item.glassTypeId)?.name
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Deps are the primitive fields, not `item`/`onCheckAvailability` — both
  // are new references on every parent render, which would reset this
  // debounce whenever an unrelated line item changes.
  useEffect(() => {
    if (!canCheckAvailability(item)) return

    const timeout = setTimeout(onCheckAvailability, 450)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.glassTypeId, item.widthIn, item.heightIn, item.quantity])

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Line item {index + 1}
        </span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onRemove}
          >
            <XIcon />
            <span className="sr-only">Remove line item</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel>Window type</FieldLabel>
          <Select
            value={item.windowTypeId}
            onValueChange={(value) => onChange({ windowTypeId: value ?? "" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select">
                {(value: string | null) =>
                  windowTypes.find((w) => String(w.id) === value)?.name ?? "Select"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {windowTypes.map((windowType) => (
                <SelectItem key={windowType.id} value={String(windowType.id)}>
                  {windowType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Glass type</FieldLabel>
          <Select
            value={item.glassTypeId}
            onValueChange={(value) => onChange({ glassTypeId: value ?? "", cutPlan: null })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select">
                {(value: string | null) =>
                  glassTypes.find((g) => String(g.id) === value)?.name ?? "Select"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {glassTypes.map((glassType) => (
                <SelectItem key={glassType.id} value={String(glassType.id)}>
                  {glassType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field>
          <FieldLabel>Width (in)</FieldLabel>
          <Input
            type="number"
            min="0.125"
            step="0.125"
            value={item.widthIn}
            onChange={(event) => onChange({ widthIn: event.target.value, cutPlan: null })}
          />
        </Field>
        <Field>
          <FieldLabel>Height (in)</FieldLabel>
          <Input
            type="number"
            min="0.125"
            step="0.125"
            value={item.heightIn}
            onChange={(event) => onChange({ heightIn: event.target.value, cutPlan: null })}
          />
        </Field>
        <Field>
          <FieldLabel>Quantity</FieldLabel>
          <Input
            type="number"
            min="1"
            step="1"
            value={item.quantity}
            onChange={(event) => onChange({ quantity: event.target.value, cutPlan: null })}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AvailabilityStatus
          item={item}
          detailsOpen={detailsOpen}
          onToggleDetails={() => setDetailsOpen((open) => !open)}
        />
        {price && (
          <span className="text-sm text-muted-foreground">
            {formatMoney(price.unitPrice)} / unit · {formatMoney(price.lineTotal)} total
          </span>
        )}
      </div>

      {detailsOpen && item.cutPlan && glassTypeName && (
        <CutPlanPreview plan={item.cutPlan} glassTypeName={glassTypeName} />
      )}
    </div>
  )
}

function AvailabilityStatus({
  item,
  detailsOpen,
  onToggleDetails,
}: {
  item: DraftLineItem
  detailsOpen: boolean
  onToggleDetails: () => void
}) {
  if (item.isChecking) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Spinner className="size-3.5" />
        Checking stock…
      </span>
    )
  }

  if (item.checkError) {
    return <span className="text-sm text-destructive">{item.checkError}</span>
  }

  const plan = item.cutPlan
  if (!plan) return null

  const isFulfilled = plan.status === "fulfilled"

  return (
    <button
      type="button"
      onClick={onToggleDetails}
      className="flex items-center gap-1.5"
    >
      <Badge variant={isFulfilled ? "secondary" : "destructive"}>
        {isFulfilled ? (
          <CircleCheckIcon data-icon="inline-start" />
        ) : (
          <AlertTriangleIcon data-icon="inline-start" />
        )}
        {isFulfilled ? "In stock" : `Short ${plan.unfulfilledQuantity}`}
      </Badge>
      <ChevronDownIcon
        className={`size-3.5 text-muted-foreground transition-transform ${detailsOpen ? "rotate-180" : ""}`}
      />
    </button>
  )
}

function CutPlanPreview({ plan, glassTypeName }: { plan: CutPlan; glassTypeName: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
      {plan.allocations.map((allocation, index) => (
        <p key={index}>
          Cut {allocation.quantityToCut} from a {allocation.piece.widthIn}×
          {allocation.piece.heightIn}in {allocation.piece.origin} piece
          {allocation.offcuts.length > 0
            ? ` — leaves ${allocation.offcuts
                .map((offcut) => `${offcut.widthIn}×${offcut.heightIn}in`)
                .join(" + ")} offcut${allocation.offcuts.length > 1 ? "s" : ""}`
            : " — exact fit, no offcut"}
        </p>
      ))}
      {plan.status === "partial" && (
        <p className="text-destructive">
          Short by {plan.unfulfilledQuantity} unit
          {plan.unfulfilledQuantity > 1 ? "s" : ""} — order more {glassTypeName}.
        </p>
      )}
    </div>
  )
}
