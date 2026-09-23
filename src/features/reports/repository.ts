import "server-only"

import { getDb } from "@/lib/db/server"

export type RevenueSummary = {
  quoteCount: number
  totalCents: number
  averageQuoteCents: number
}

export async function getRevenueSummary(from: string, to: string): Promise<RevenueSummary> {
  const { data, error } = await getDb().rpc("get_revenue_summary", { p_from: from, p_to: to })
  if (error) throw error

  const row = data[0]
  return {
    quoteCount: row?.quote_count ?? 0,
    totalCents: row?.total_cents ?? 0,
    averageQuoteCents: row?.average_quote_cents ?? 0,
  }
}

export type GlassTypeSaleByDay = {
  saleDate: string
  glassTypeName: string
  totalCents: number
}

export async function getGlassTypeSalesByDay(
  from: string,
  to: string
): Promise<GlassTypeSaleByDay[]> {
  const { data, error } = await getDb().rpc("get_glass_type_sales_by_day", {
    p_from: from,
    p_to: to,
  })
  if (error) throw error

  return data.map((row) => ({
    saleDate: row.sale_date,
    glassTypeName: row.glass_type_name,
    totalCents: row.total_cents,
  }))
}

export type OrderStatusSummary = {
  scheduledCount: number
  overdueCount: number
  completeCount: number
}

export async function getOrderStatusSummary(asOf: string): Promise<OrderStatusSummary> {
  const { data, error } = await getDb().rpc("get_order_status_summary", { p_as_of: asOf })
  if (error) throw error

  const row = data[0]
  return {
    scheduledCount: row?.scheduled_count ?? 0,
    overdueCount: row?.overdue_count ?? 0,
    completeCount: row?.complete_count ?? 0,
  }
}

export type GlassTypeDemand = {
  glassTypeName: string
  totalQuantity: number
  totalSqft: number
}

export async function getGlassTypeDemand(
  from: string,
  to: string,
  limit: number
): Promise<GlassTypeDemand[]> {
  const { data, error } = await getDb().rpc("get_glass_type_demand", {
    p_from: from,
    p_to: to,
    p_limit: limit,
  })
  if (error) throw error

  return data.map((row) => ({
    glassTypeName: row.glass_type_name,
    totalQuantity: row.total_quantity,
    totalSqft: row.total_sqft,
  }))
}

export type QuoteConversionSummary = {
  pendingCount: number
  approvedCount: number
  declinedCount: number
  approvalRate: number
}

export async function getQuoteConversionSummary(
  from: string,
  to: string
): Promise<QuoteConversionSummary> {
  const { data, error } = await getDb().rpc("get_quote_conversion_summary", {
    p_from: from,
    p_to: to,
  })
  if (error) throw error

  const row = data[0]
  return {
    pendingCount: row?.pending_count ?? 0,
    approvedCount: row?.approved_count ?? 0,
    declinedCount: row?.declined_count ?? 0,
    approvalRate: row?.approval_rate ?? 0,
  }
}

export type TopCustomer = {
  customerId: number
  customerName: string
  totalCents: number
  quoteCount: number
}

export async function getTopCustomersByRevenue(
  from: string,
  to: string,
  limit: number
): Promise<TopCustomer[]> {
  const { data, error } = await getDb().rpc("get_top_customers_by_revenue", {
    p_from: from,
    p_to: to,
    p_limit: limit,
  })
  if (error) throw error

  return data.map((row) => ({
    customerId: row.customer_id,
    customerName: row.customer_name,
    totalCents: row.total_cents,
    quoteCount: row.quote_count,
  }))
}
