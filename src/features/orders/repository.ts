import "server-only"

import {
  completedOrderSchema,
  orderIdSchema,
  orderStatusSchema,
  scheduledOrderSchema,
  type Order,
  type OrderId,
  type OrderStatus,
} from "@/core/orders/order.types"
import { quoteIdSchema, type ApprovedQuote, type QuoteId } from "@/core/quotes/quote.types"
import { moneySchema, type Money } from "@/core/shared/money"
import { paginate } from "@/lib/db/paginate"
import { getDb } from "@/lib/db/server"
import type { Database } from "@/lib/db/types"

type OrderRow = Database["public"]["Tables"]["orders"]["Row"]
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"]
type QuoteLineItemRow = Database["public"]["Tables"]["quote_line_items"]["Row"]
type WindowTypeRow = Database["public"]["Tables"]["window_types"]["Row"]
type GlassTypeRow = Database["public"]["Tables"]["glass_types"]["Row"]

function toOrder(row: OrderRow): Order {
  const base = {
    id: row.id,
    quoteId: row.quote_id,
    installationDate: row.installation_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }

  switch (orderStatusSchema.parse(row.status)) {
    case "scheduled":
      return scheduledOrderSchema.parse({ ...base, status: "scheduled" })
    case "complete":
      return completedOrderSchema.parse({
        ...base,
        status: "complete",
        completedAt: row.completed_at,
      })
  }
}

export async function getOrder(id: OrderId): Promise<Order | null> {
  const { data, error } = await getDb()
    .from("orders")
    .select()
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return toOrder(data)
}

export async function getOrderByQuoteId(quoteId: QuoteId): Promise<Order | null> {
  const { data, error } = await getDb()
    .from("orders")
    .select()
    .eq("quote_id", quoteId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return toOrder(data)
}

export type NewOrderAllocation = {
  decrements: { pieceId: number; amount: number }[]
  newPieces: {
    glassTypeId: number
    widthIn: number
    heightIn: number
    quantity: number
  }[]
}

// Only accepts an ApprovedQuote, matching AGENTS.md's rule that creating an
// order is a function that only accepts an approved quote, not a quote plus
// a status flag — enforced here at the actual write, not just decoratively
// in Core, since the id needed to construct a real ScheduledOrder doesn't
// exist until this insert returns it.
export async function createOrderFromQuote(
  quote: ApprovedQuote,
  installationDate: string,
  allocation: NewOrderAllocation
): Promise<OrderId> {
  const { data, error } = await getDb().rpc("create_order_from_quote", {
    payload: {
      quote_id: quote.id,
      installation_date: installationDate,
      decrements: allocation.decrements.map((decrement) => ({
        piece_id: decrement.pieceId,
        amount: decrement.amount,
      })),
      new_pieces: allocation.newPieces.map((piece) => ({
        glass_type_id: piece.glassTypeId,
        width_in: piece.widthIn,
        height_in: piece.heightIn,
        quantity: piece.quantity,
      })),
    },
  })

  if (error) throw error

  return orderIdSchema.parse(data)
}

export async function markOrderComplete(
  id: OrderId,
  completedAt: string
): Promise<void> {
  const { error } = await getDb()
    .from("orders")
    .update({ status: "complete", completed_at: completedAt })
    .eq("id", id)

  if (error) throw error
}

export const ORDERS_PAGE_SIZE = 5

export type OrderSummary = {
  id: OrderId
  quoteId: QuoteId
  customerName: string
  status: OrderStatus
  installationDate: string
  total: Money
}

export type OrdersPage = {
  orders: OrderSummary[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

type OrderListRow = OrderRow & {
  quotes: {
    customers: Pick<CustomerRow, "first_name" | "last_name"> | null
    quote_line_items: Pick<QuoteLineItemRow, "line_total_cents">[]
  } | null
}

function toOrderSummary(row: OrderListRow): OrderSummary {
  const customer = row.quotes?.customers
  const lineItems = row.quotes?.quote_line_items ?? []

  return {
    id: orderIdSchema.parse(row.id),
    quoteId: quoteIdSchema.parse(row.quote_id),
    customerName: customer
      ? `${customer.first_name} ${customer.last_name}`
      : "Unknown customer",
    status: orderStatusSchema.parse(row.status),
    installationDate: row.installation_date,
    total: moneySchema.parse(
      lineItems.reduce((sum, lineItem) => sum + lineItem.line_total_cents, 0)
    ),
  }
}

export async function listOrders(page: number): Promise<OrdersPage> {
  const result = await paginate<OrderListRow>({
    page,
    pageSize: ORDERS_PAGE_SIZE,
    count: () => getDb().from("orders").select("*", { count: "exact", head: true }),
    data: ({ from, to }) =>
      getDb()
        .from("orders")
        .select(
          "*, quotes(customers(first_name,last_name), quote_line_items(line_total_cents))"
        )
        .order("installation_date", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to),
  })

  return {
    orders: result.items.map(toOrderSummary),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  }
}

// Scheduled (not yet installed) orders, soonest installation first — for a
// dashboard widget, not the full paginated Orders list.
export async function listPendingOrders(limit: number): Promise<OrderSummary[]> {
  const { data, error } = await getDb()
    .from("orders")
    .select("*, quotes(customers(first_name,last_name), quote_line_items(line_total_cents))")
    .eq("status", "scheduled")
    .order("installation_date", { ascending: true })
    .order("id", { ascending: true })
    .limit(limit)

  if (error) throw error

  return data.map(toOrderSummary)
}

export type OrderDetailLineItem = {
  id: QuoteLineItemRow["id"]
  windowTypeName: string
  glassTypeName: string
  widthIn: QuoteLineItemRow["width_in"]
  heightIn: QuoteLineItemRow["height_in"]
  quantity: QuoteLineItemRow["quantity"]
  unitPrice: Money
  lineTotal: Money
}

export type OrderDetail = {
  id: OrderId
  quoteId: QuoteId
  customerName: string
  status: OrderStatus
  installationDate: string
  completedAt: string | null
  lineItems: OrderDetailLineItem[]
  total: Money
}

type OrderDetailRow = OrderRow & {
  quotes: {
    customers: Pick<CustomerRow, "first_name" | "last_name"> | null
    quote_line_items: (QuoteLineItemRow & {
      window_types: Pick<WindowTypeRow, "name"> | null
      glass_types: Pick<GlassTypeRow, "name"> | null
    })[]
  } | null
}

export async function getOrderDetail(id: OrderId): Promise<OrderDetail | null> {
  const { data: row, error } = await getDb()
    .from("orders")
    .select(
      "*, quotes(customers(first_name,last_name), quote_line_items(*, window_types(name), glass_types(name)))"
    )
    .eq("id", id)
    .maybeSingle<OrderDetailRow>()

  if (error) throw error
  if (!row) return null

  const customer = row.quotes?.customers
  const lineItems: OrderDetailLineItem[] = (row.quotes?.quote_line_items ?? []).map(
    (lineItem) => ({
      id: lineItem.id,
      windowTypeName: lineItem.window_types?.name ?? "Unknown window type",
      glassTypeName: lineItem.glass_types?.name ?? "Unknown glass type",
      widthIn: lineItem.width_in,
      heightIn: lineItem.height_in,
      quantity: lineItem.quantity,
      unitPrice: moneySchema.parse(lineItem.unit_price_cents),
      lineTotal: moneySchema.parse(lineItem.line_total_cents),
    })
  )

  return {
    id: orderIdSchema.parse(row.id),
    quoteId: quoteIdSchema.parse(row.quote_id),
    customerName: customer
      ? `${customer.first_name} ${customer.last_name}`
      : "Unknown customer",
    status: orderStatusSchema.parse(row.status),
    installationDate: row.installation_date,
    completedAt: row.completed_at,
    lineItems,
    total: moneySchema.parse(
      lineItems.reduce((sum, lineItem) => sum + lineItem.lineTotal, 0)
    ),
  }
}
