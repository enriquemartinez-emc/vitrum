"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox"
import { fullName } from "@/core/customers/customer.rules"
import type { Customer } from "@/core/customers/customer.types"
import { CustomerFormDialog } from "@/features/customers/components/customer-form-dialog"

export function CustomerCombobox({
  customers,
  value,
  onValueChange,
  onCustomerCreated,
}: {
  customers: Customer[]
  value: Customer | null
  onValueChange: (customer: Customer | null) => void
  onCustomerCreated: (customer: Customer) => void
}) {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <Combobox
        items={customers}
        value={value}
        onValueChange={onValueChange}
        itemToStringLabel={(customer: Customer) => fullName(customer)}
        itemToStringValue={(customer: Customer) => fullName(customer)}
      >
        <ComboboxInput placeholder="Search customers…" />
        <ComboboxContent>
          <ComboboxEmpty>No customers found.</ComboboxEmpty>
          <ComboboxList>
            {(customer: Customer) => (
              <ComboboxItem key={customer.id} value={customer}>
                {fullName(customer)}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxSeparator />
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start px-2 font-normal"
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon data-icon="inline-start" />
            Add new customer
          </Button>
        </ComboboxContent>
      </Combobox>

      <CustomerFormDialog
        mode="create"
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(customer) => {
          onCustomerCreated(customer)
          onValueChange(customer)
        }}
      />
    </>
  )
}
