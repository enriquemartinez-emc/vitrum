"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { GlassPiece } from "@/core/inventory/glass-piece.types"
import { suggestCutPlan } from "@/core/inventory/cut-plan.rules"
import type { CutAllocation } from "@/core/inventory/cut-plan.types"
import { completeOrder } from "@/core/orders/order.rules"
import { orderIdSchema } from "@/core/orders/order.types"
import { glassTypeIdSchema } from "@/core/products/glass-type.types"
import { quoteIdSchema, type QuoteLineItem } from "@/core/quotes/quote.types"
import { quantitySchema } from "@/core/shared/quantity"
import * as inventoryRepository from "@/features/inventory/repository"
import type { OrderDetail } from "@/features/orders/repository"
import * as ordersRepository from "@/features/orders/repository"
import * as glassTypesRepository from "@/features/products/glass-types.repository"
import * as quotesRepository from "@/features/quotes/repository"

export type OrderFormState = {
  status: "idle" | "error" | "success"
  message?: string
}

export const initialOrderFormState: OrderFormState = { status: "idle" }

const createOrderInputSchema = z.object({
  quoteId: z.coerce.number().int().positive(),
  installationDate: z.iso.date(),
})

// Plans every line item's cut against a single running view of inventory, so
// two line items in the same order can't both be allocated more of the same
// physical piece than it actually has.
async function planLineItems(lineItems: QuoteLineItem[]): Promise<
  | { status: "fulfilled"; allocations: CutAllocation[] }
  | { status: "insufficient"; shortfalls: string[] }
> {
  const candidatesByGlassType = new Map<number, GlassPiece[]>()
  const remainingByPieceId = new Map<number, number>()

  async function candidatesFor(glassTypeId: number): Promise<GlassPiece[]> {
    const cached = candidatesByGlassType.get(glassTypeId)
    if (cached) return cached

    const pieces = await inventoryRepository.listGlassPiecesByType(
      glassTypeIdSchema.parse(glassTypeId)
    )
    candidatesByGlassType.set(glassTypeId, pieces)
    for (const piece of pieces) remainingByPieceId.set(piece.id, piece.quantity)
    return pieces
  }

  const allocations: CutAllocation[] = []
  const shortfalls: string[] = []

  for (const lineItem of lineItems) {
    const candidates = await candidatesFor(lineItem.glassTypeId)
    const available = candidates.flatMap((piece) => {
      const remaining = remainingByPieceId.get(piece.id) ?? 0
      return remaining > 0
        ? [{ ...piece, quantity: quantitySchema.parse(remaining) }]
        : []
    })

    const plan = suggestCutPlan(
      {
        glassTypeId: lineItem.glassTypeId,
        widthIn: lineItem.widthIn,
        heightIn: lineItem.heightIn,
        quantity: lineItem.quantity,
      },
      available
    )

    if (plan.status === "partial") {
      const glassType = await glassTypesRepository.getGlassType(lineItem.glassTypeId)
      shortfalls.push(
        `${glassType?.name ?? "glass"} — short ${plan.unfulfilledQuantity} unit${plan.unfulfilledQuantity > 1 ? "s" : ""}`
      )
      continue
    }

    for (const allocation of plan.allocations) {
      const remaining = remainingByPieceId.get(allocation.piece.id) ?? 0
      remainingByPieceId.set(allocation.piece.id, remaining - allocation.quantityToCut)
    }
    allocations.push(...plan.allocations)
  }

  if (shortfalls.length > 0) return { status: "insufficient", shortfalls }
  return { status: "fulfilled", allocations }
}

export async function createOrderAction(
  _prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const parsed = createOrderInputSchema.safeParse({
    quoteId: formData.get("quoteId"),
    installationDate: formData.get("installationDate"),
  })

  if (!parsed.success) {
    return { status: "error", message: "Enter a valid installation date." }
  }

  const quoteId = quoteIdSchema.parse(parsed.data.quoteId)

  const [quote, existingOrder] = await Promise.all([
    quotesRepository.getQuote(quoteId),
    ordersRepository.getOrderByQuoteId(quoteId),
  ])

  if (!quote || quote.status !== "approved") {
    return { status: "error", message: "This quote isn't approved." }
  }

  if (existingOrder) {
    return { status: "error", message: "This quote already has an order." }
  }

  const plan = await planLineItems(quote.lineItems)

  if (plan.status === "insufficient") {
    return {
      status: "error",
      message: `Not enough glass in stock to fulfill this order: ${plan.shortfalls.join("; ")}.`,
    }
  }

  await ordersRepository.createOrderFromQuote(quote, parsed.data.installationDate, {
    decrements: plan.allocations.map((allocation) => ({
      pieceId: allocation.piece.id,
      amount: allocation.quantityToCut,
    })),
    newPieces: plan.allocations.flatMap((allocation) =>
      allocation.offcuts.map((offcut) => ({
        glassTypeId: allocation.piece.glassTypeId,
        widthIn: offcut.widthIn,
        heightIn: offcut.heightIn,
        quantity: allocation.quantityToCut,
      }))
    ),
  })

  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/quotes")

  return { status: "success" }
}

export async function getOrderDetailAction(id: number): Promise<OrderDetail | null> {
  return ordersRepository.getOrderDetail(orderIdSchema.parse(id))
}

export async function completeOrderAction(id: number): Promise<void> {
  const orderId = orderIdSchema.parse(id)
  const order = await ordersRepository.getOrder(orderId)
  if (!order || order.status !== "scheduled") return

  const completed = completeOrder(order, new Date().toISOString())
  await ordersRepository.markOrderComplete(completed.id, completed.completedAt)

  revalidatePath("/dashboard/orders")
}
