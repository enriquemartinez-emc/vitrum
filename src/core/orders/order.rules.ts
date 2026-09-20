import type { ApprovedQuote } from "@/core/quotes/quote.types"
import type {
  CompletedOrder,
  OrderId,
  ScheduledOrder,
} from "@/core/orders/order.types"

export function createOrder(
  quote: ApprovedQuote,
  id: OrderId,
  installationDate: string,
  createdAt: string
): ScheduledOrder {
  return {
    id,
    quoteId: quote.id,
    installationDate,
    status: "scheduled",
    createdAt,
    updatedAt: createdAt,
  }
}

export function completeOrder(
  order: ScheduledOrder,
  completedAt: string
): CompletedOrder {
  return {
    id: order.id,
    quoteId: order.quoteId,
    installationDate: order.installationDate,
    status: "complete",
    completedAt,
    createdAt: order.createdAt,
    updatedAt: completedAt,
  }
}
