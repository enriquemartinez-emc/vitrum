import "server-only"

import {
  customerSchema,
  type Customer,
  type CustomerId,
  type NewCustomer,
} from "@/core/customers/customer.types"
import { paginate } from "@/lib/db/paginate"
import { getDb } from "@/lib/db/server"
import type { Database } from "@/lib/db/types"

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"]

function toCustomer(row: CustomerRow): Customer {
  return customerSchema.parse({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phoneNumber: row.phone_number,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

export const CUSTOMERS_PAGE_SIZE = 5

export type CustomersPage = {
  customers: Customer[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export async function listCustomers(page: number): Promise<CustomersPage> {
  const result = await paginate<CustomerRow>({
    page,
    pageSize: CUSTOMERS_PAGE_SIZE,
    count: () =>
      getDb().from("customers").select("*", { count: "exact", head: true }),
    data: ({ from, to }) =>
      getDb()
        .from("customers")
        .select()
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
  })

  return {
    customers: result.items.map(toCustomer),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  }
}

export async function getCustomer(id: CustomerId): Promise<Customer | null> {
  const { data, error } = await getDb()
    .from("customers")
    .select()
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return toCustomer(data)
}

export async function insertCustomer(input: NewCustomer): Promise<Customer> {
  const { data, error } = await getDb()
    .from("customers")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phoneNumber,
      address: input.address,
    })
    .select()
    .single()

  if (error) throw error

  return toCustomer(data)
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
  const { data, error } = await getDb()
    .from("customers")
    .update({
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone_number: customer.phoneNumber,
      address: customer.address,
    })
    .eq("id", customer.id)
    .select()
    .single()

  if (error) throw error

  return toCustomer(data)
}

export async function deleteCustomer(id: CustomerId): Promise<void> {
  const { error } = await getDb().from("customers").delete().eq("id", id)

  if (error) throw error
}
