import { UsersIcon } from "lucide-react"

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
import { fullName } from "@/core/customers/customer.rules"
import { AddCustomerButton } from "@/features/customers/components/add-customer-button"
import { CustomerRowActions } from "@/features/customers/components/customer-row-actions"
import type { CustomersPage } from "@/features/customers/repository"

function pageHref(page: number) {
  return page === 1
    ? "/dashboard/customers"
    : `/dashboard/customers?page=${page}`
}

export function CustomersTable({
  customersPage,
}: {
  customersPage: CustomersPage
}) {
  const { customers, page, pageSize, totalCount, totalPages } = customersPage
  const firstRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "customer" : "customers"}
        </p>
        <AddCustomerButton />
      </div>

      {totalCount === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>No customers yet</EmptyTitle>
            <EmptyDescription>
              Add your first customer to start creating quotes.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <AddCustomerButton />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {fullName(customer)}
                      </TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.address ?? "—"}
                      </TableCell>
                      <TableCell>
                        <CustomerRowActions customer={customer} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {firstRow}–{lastRow} of {totalCount}
            </div>
            <TablePagination
              page={page}
              totalPages={totalPages}
              buildHref={pageHref}
            />
          </div>
        </>
      )}
    </div>
  )
}
