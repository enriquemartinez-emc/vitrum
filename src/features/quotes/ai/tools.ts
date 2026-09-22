import "server-only"

import { tool } from "ai"
import { z } from "zod"

import { fullName, searchCustomersByName } from "@/core/customers/customer.rules"
import { customerSchema } from "@/core/customers/customer.types"
import { glassTypeSchema } from "@/core/products/glass-type.types"
import { windowTypeSchema } from "@/core/products/window-type.types"

// Static tool definitions, defined once. Each request's catalog is supplied
// through `toolsContext` on the `generate()` call (see extraction.ts), not by
// rebuilding these tools — `contextSchema` re-validates that data against the
// same Core schemas the repositories already produce. The matching/filtering
// logic itself lives in Core (customer.rules.ts) so it's unit-testable
// without touching the AI SDK's tool-execution contract.

export const searchCustomersTool = tool({
  description:
    "Search existing customers by full or partial name and get their id. " +
    "Call this before setting customerId — never guess an id.",
  inputSchema: z.object({
    query: z.string().describe("Full or partial customer name to search for"),
  }),
  contextSchema: z.object({ customers: z.array(customerSchema) }),
  execute: async ({ query }, { context }) => ({
    matches: searchCustomersByName(context.customers, query).map((customer) => ({
      id: customer.id,
      name: fullName(customer),
    })),
  }),
})

export const listWindowTypesTool = tool({
  description:
    "List every window type this shop offers, with its id. Call this before " +
    "setting a line item's windowTypeId — never guess an id.",
  inputSchema: z.object({}),
  contextSchema: z.object({ windowTypes: z.array(windowTypeSchema) }),
  execute: async (_input, { context }) => ({
    windowTypes: context.windowTypes.map((windowType) => ({
      id: windowType.id,
      name: windowType.name,
    })),
  }),
})

export const listGlassTypesTool = tool({
  description:
    "List every glass type this shop stocks, with its id. Call this before " +
    "setting a line item's glassTypeId — never guess an id.",
  inputSchema: z.object({}),
  contextSchema: z.object({ glassTypes: z.array(glassTypeSchema) }),
  execute: async (_input, { context }) => ({
    glassTypes: context.glassTypes.map((glassType) => ({
      id: glassType.id,
      name: glassType.name,
    })),
  }),
})
