import "server-only"

import { customerIdSchema, type CustomerId } from "@/core/customers/customer.types"
import {
  approvedQuoteSchema,
  declinedQuoteSchema,
  pendingQuoteSchema,
  quoteIdSchema,
  quoteLineItemSchema,
  quoteStatusSchema,
  type NewQuoteLineItem,
  type PendingQuote,
  type Quote,
  type QuoteId,
  type QuoteLineItem,
  type QuoteStatus,
} from "@/core/quotes/quote.types"
import { moneySchema, type Money } from "@/core/shared/money"
import { paginate } from "@/lib/db/paginate"
import { getDb } from "@/lib/db/server"
import type { Database } from "@/lib/db/types"

type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"]
type QuoteLineItemRow = Database["public"]["Tables"]["quote_line_items"]["Row"]
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"]
type WindowTypeRow = Database["public"]["Tables"]["window_types"]["Row"]
type GlassTypeRow = Database["public"]["Tables"]["glass_types"]["Row"]

function toQuoteLineItem(row: QuoteLineItemRow): QuoteLineItem {
  return quoteLineItemSchema.parse({
    id: row.id,
    windowTypeId: row.window_type_id,
    glassTypeId: row.glass_type_id,
    widthIn: row.width_in,
    heightIn: row.height_in,
    quantity: row.quantity,
    unitPrice: row.unit_price_cents,
    lineTotal: row.line_total_cents,
  })
}

// A quote is pending | approved | declined; this switch is the one place
// a DB row (status column + nullable decision timestamps) gets translated
// into that closed union, so every other layer works with the real type.
function toQuote(row: QuoteRow, lineItemRows: QuoteLineItemRow[]): Quote {
  const base = {
    id: row.id,
    customerId: row.customer_id,
    lineItems: lineItemRows.map(toQuoteLineItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }

  switch (quoteStatusSchema.parse(row.status)) {
    case "pending":
      return pendingQuoteSchema.parse({ ...base, status: "pending" })
    case "approved":
      return approvedQuoteSchema.parse({
        ...base,
        status: "approved",
        approvedAt: row.approved_at,
      })
    case "declined":
      return declinedQuoteSchema.parse({
        ...base,
        status: "declined",
        declinedAt: row.declined_at,
      })
  }
}

export type NewQuoteLineItemInput = NewQuoteLineItem & {
  unitPrice: Money
  lineTotal: Money
}

export const QUOTES_PAGE_SIZE = 5

export type QuoteSummary = {
  id: QuoteId
  customerId: CustomerId
  customerName: string
  status: QuoteStatus
  lineItemCount: number
  total: Money
  createdAt: string
}

export type QuotesPage = {
  quotes: QuoteSummary[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

type QuoteListRow = QuoteRow & {
  customers: Pick<CustomerRow, "first_name" | "last_name"> | null
  quote_line_items: Pick<QuoteLineItemRow, "line_total_cents">[]
}

function toQuoteSummary(row: QuoteListRow): QuoteSummary {
  return {
    id: quoteIdSchema.parse(row.id),
    customerId: customerIdSchema.parse(row.customer_id),
    customerName: row.customers
      ? `${row.customers.first_name} ${row.customers.last_name}`
      : "Unknown customer",
    status: quoteStatusSchema.parse(row.status),
    lineItemCount: row.quote_line_items.length,
    total: moneySchema.parse(
      row.quote_line_items.reduce(
        (sum, lineItem) => sum + lineItem.line_total_cents,
        0
      )
    ),
    createdAt: row.created_at,
  }
}

export async function listQuotes(page: number): Promise<QuotesPage> {
  const result = await paginate<QuoteListRow>({
    page,
    pageSize: QUOTES_PAGE_SIZE,
    count: () => getDb().from("quotes").select("*", { count: "exact", head: true }),
    data: ({ from, to }) =>
      getDb()
        .from("quotes")
        .select("*, customers(first_name,last_name), quote_line_items(line_total_cents)")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
  })

  return {
    quotes: result.items.map(toQuoteSummary),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  }
}

export async function getQuote(id: QuoteId): Promise<Quote | null> {
  const { data: quoteRow, error: quoteError } = await getDb()
    .from("quotes")
    .select()
    .eq("id", id)
    .maybeSingle()

  if (quoteError) throw quoteError
  if (!quoteRow) return null

  const { data: lineItemRows, error: lineItemsError } = await getDb()
    .from("quote_line_items")
    .select()
    .eq("quote_id", id)
    .order("id", { ascending: true })

  if (lineItemsError) throw lineItemsError

  return toQuote(quoteRow, lineItemRows)
}

export type QuoteDetailLineItem = {
  id: QuoteLineItemRow["id"]
  windowTypeName: string
  glassTypeName: string
  widthIn: QuoteLineItemRow["width_in"]
  heightIn: QuoteLineItemRow["height_in"]
  quantity: QuoteLineItemRow["quantity"]
  unitPrice: Money
  lineTotal: Money
}

export type QuoteDetail = {
  id: QuoteId
  customerName: string
  status: QuoteStatus
  approvedAt: string | null
  declinedAt: string | null
  createdAt: string
  lineItems: QuoteDetailLineItem[]
  total: Money
  order: { id: number; status: string; installationDate: string } | null
}

type QuoteOrderRow = Database["public"]["Tables"]["orders"]["Row"]

type QuoteDetailRow = QuoteRow & {
  customers: Pick<CustomerRow, "first_name" | "last_name"> | null
  quote_line_items: (QuoteLineItemRow & {
    window_types: Pick<WindowTypeRow, "name"> | null
    glass_types: Pick<GlassTypeRow, "name"> | null
  })[]
  orders: Pick<QuoteOrderRow, "id" | "status" | "installation_date"> | null
}

export async function getQuoteDetail(id: QuoteId): Promise<QuoteDetail | null> {
  const { data: row, error } = await getDb()
    .from("quotes")
    .select(
      "*, customers(first_name,last_name), quote_line_items(*, window_types(name), glass_types(name)), orders(id, status, installation_date)"
    )
    .eq("id", id)
    .maybeSingle<QuoteDetailRow>()

  if (error) throw error
  if (!row) return null

  const lineItems = row.quote_line_items.map((lineItem) => ({
    id: lineItem.id,
    windowTypeName: lineItem.window_types?.name ?? "Unknown window type",
    glassTypeName: lineItem.glass_types?.name ?? "Unknown glass type",
    widthIn: lineItem.width_in,
    heightIn: lineItem.height_in,
    quantity: lineItem.quantity,
    unitPrice: moneySchema.parse(lineItem.unit_price_cents),
    lineTotal: moneySchema.parse(lineItem.line_total_cents),
  }))

  return {
    id: quoteIdSchema.parse(row.id),
    customerName: row.customers
      ? `${row.customers.first_name} ${row.customers.last_name}`
      : "Unknown customer",
    status: quoteStatusSchema.parse(row.status),
    approvedAt: row.approved_at,
    declinedAt: row.declined_at,
    createdAt: row.created_at,
    lineItems,
    total: moneySchema.parse(
      lineItems.reduce((sum, lineItem) => sum + lineItem.lineTotal, 0)
    ),
    order: row.orders
      ? {
          id: row.orders.id,
          status: row.orders.status,
          installationDate: row.orders.installation_date,
        }
      : null,
  }
}

export async function insertQuote(
  customerId: CustomerId,
  lineItems: NewQuoteLineItemInput[]
): Promise<PendingQuote> {
  const { data: quoteRow, error: quoteError } = await getDb()
    .from("quotes")
    .insert({ customer_id: customerId, status: "pending" })
    .select()
    .single()

  if (quoteError) throw quoteError

  const { data: lineItemRows, error: lineItemsError } = await getDb()
    .from("quote_line_items")
    .insert(
      lineItems.map((lineItem) => ({
        quote_id: quoteRow.id,
        window_type_id: lineItem.windowTypeId,
        glass_type_id: lineItem.glassTypeId,
        width_in: lineItem.widthIn,
        height_in: lineItem.heightIn,
        quantity: lineItem.quantity,
        unit_price_cents: lineItem.unitPrice,
        line_total_cents: lineItem.lineTotal,
      }))
    )
    .select()

  if (lineItemsError) throw lineItemsError

  return pendingQuoteSchema.parse({
    id: quoteRow.id,
    customerId: quoteRow.customer_id,
    lineItems: lineItemRows.map(toQuoteLineItem),
    status: "pending",
    createdAt: quoteRow.created_at,
    updatedAt: quoteRow.updated_at,
  })
}

export async function markQuoteApproved(
  id: QuoteId,
  approvedAt: string
): Promise<void> {
  const { error } = await getDb()
    .from("quotes")
    .update({ status: "approved", approved_at: approvedAt })
    .eq("id", id)

  if (error) throw error
}

export async function markQuoteDeclined(
  id: QuoteId,
  declinedAt: string
): Promise<void> {
  const { error } = await getDb()
    .from("quotes")
    .update({ status: "declined", declined_at: declinedAt })
    .eq("id", id)

  if (error) throw error
}
