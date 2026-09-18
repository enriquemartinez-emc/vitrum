"use client"

import { useState } from "react"
import { PlusIcon, ReceiptTextIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TablePagination } from "@/components/table-pagination"
import type { Customer } from "@/core/customers/customer.types"
import type { GlassType } from "@/core/products/glass-type.types"
import type { WindowType } from "@/core/products/window-type.types"
import { formatMoney } from "@/core/shared/money"
import { CreateQuoteDrawer } from "@/features/quotes/components/create-quote-drawer"
import { QuoteDetailDrawer } from "@/features/quotes/components/quote-detail-drawer"
import type { QuoteSummary, QuotesPage } from "@/features/quotes/repository"

const STATUS_LABEL: Record<QuoteSummary["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
}

const STATUS_VARIANT: Record<QuoteSummary["status"], "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  declined: "destructive",
}

function pageHref(page: number) {
  return page === 1 ? "/dashboard/quotes" : `/dashboard/quotes?page=${page}`
}

export function QuotesTable({
  quotesPage,
  customers,
  windowTypes,
  glassTypes,
}: {
  quotesPage: QuotesPage
  customers: Customer[]
  windowTypes: WindowType[]
  glassTypes: GlassType[]
}) {
  const { quotes, page, pageSize, totalCount, totalPages } = quotesPage
  const firstRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalCount)

  const [createOpen, setCreateOpen] = useState(false)
  const [detailQuoteId, setDetailQuoteId] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "quote" : "quotes"}
        </p>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New quote
        </Button>
      </div>

      {totalCount === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptTextIcon />
            </EmptyMedia>
            <EmptyTitle>No quotes yet</EmptyTitle>
            <EmptyDescription>
              Create your first quote to start pricing windows for a customer.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              New quote
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Line items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.customerName}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[quote.status]}>
                        {STATUS_LABEL[quote.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {quote.lineItemCount}
                    </TableCell>
                    <TableCell>{formatMoney(quote.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailQuoteId(quote.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {firstRow}–{lastRow} of {totalCount}
            </div>
            <TablePagination page={page} totalPages={totalPages} buildHref={pageHref} />
          </div>
        </>
      )}

      <CreateQuoteDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        customers={customers}
        windowTypes={windowTypes}
        glassTypes={glassTypes}
      />
      <QuoteDetailDrawer
        quoteId={detailQuoteId}
        open={detailQuoteId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailQuoteId(null)
        }}
      />
    </div>
  )
}
