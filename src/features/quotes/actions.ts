"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { customerIdSchema } from "@/core/customers/customer.types"
import { declineQuote, priceLineItem } from "@/core/quotes/quote.rules"
import { newQuoteLineItemSchema, quoteIdSchema } from "@/core/quotes/quote.types"
import type { QuoteFormState } from "@/features/quotes/form-state"
import * as repository from "@/features/quotes/repository"
import type { QuoteDetail } from "@/features/quotes/repository"
import * as glassTypesRepository from "@/features/products/glass-types.repository"
import * as windowTypesRepository from "@/features/products/window-types.repository"

const customerIdInputSchema = z.coerce
  .number()
  .int()
  .positive()
  .transform((value) => customerIdSchema.parse(value))

const createQuoteFormSchema = z.object({
  customerId: customerIdInputSchema,
  lineItems: z.array(newQuoteLineItemSchema).min(1),
})

function readCreateQuoteForm(formData: FormData) {
  const lineItemsRaw = formData.get("lineItems")
  let lineItems: unknown = []

  if (typeof lineItemsRaw === "string") {
    try {
      lineItems = JSON.parse(lineItemsRaw)
    } catch {
      lineItems = []
    }
  }

  return {
    customerId: formData.get("customerId"),
    lineItems,
  }
}

export async function createQuoteAction(
  _prevState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const parsed = createQuoteFormSchema.safeParse(readCreateQuoteForm(formData))

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the customer and line item details.",
    }
  }

  const pricedLineItems: repository.NewQuoteLineItemInput[] = []

  for (const lineItem of parsed.data.lineItems) {
    const [windowType, glassType] = await Promise.all([
      windowTypesRepository.getWindowType(lineItem.windowTypeId),
      glassTypesRepository.getGlassType(lineItem.glassTypeId),
    ])

    if (!windowType || !glassType) {
      return {
        status: "error",
        message: "One of the selected window or glass types no longer exists.",
      }
    }

    const { unitPrice, lineTotal } = priceLineItem(lineItem, windowType, glassType)
    pricedLineItems.push({ ...lineItem, unitPrice, lineTotal })
  }

  await repository.insertQuote(parsed.data.customerId, pricedLineItems)

  revalidatePath("/dashboard/quotes")

  return { status: "success" }
}

export async function getQuoteDetailAction(id: number): Promise<QuoteDetail | null> {
  return repository.getQuoteDetail(quoteIdSchema.parse(id))
}

export async function declineQuoteAction(id: number): Promise<void> {
  const quote = await repository.getQuote(quoteIdSchema.parse(id))
  if (!quote || quote.status !== "pending") return

  const declined = declineQuote(quote, new Date().toISOString())
  await repository.markQuoteDeclined(declined.id, declined.declinedAt)

  revalidatePath("/dashboard/quotes")
}
