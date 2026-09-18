# Vitrum — Window Shop Business App

Vitrum is a web application for a window shop business: quoting, ordering, and installation
tracking for custom windows.

## Domain workflow

1. A **customer** requests a **quote** for one or more windows. Each line item is priced from:
   window type, glass type, height, width, quantity, and a labor cost preset per window type.
2. The customer **approves** or **declines** the quote.
   - Declined quotes are kept forever for historic reasons — never deleted.
3. An approved quote becomes an **order**. An order can only exist for an approved quote — it is
   not a separate thing the user fills out from scratch.
4. At order creation, an **installation date** is agreed with the customer.
5. Once installed, the order is marked **complete**.

Model this so illegal states are unrepresentable rather than guarded with runtime checks —
e.g. a quote's status (pending / approved / declined) and an order's status (scheduled /
installed) should be distinct types, and "create order" should be a function that only accepts
an _approved_ quote, not any quote plus a status flag.

## Initial features

Build with small, realistic seeded data (not empty tables, not thousands of rows):

- **Customers management** — CRUD for customers.
- **Products management** — window types, glass types, and their labor cost presets.
- **Quote generation** — build a quote from a customer + line items, price it, record the
  customer's decision (approve/decline).
- **Order management** — create an order from an approved quote, set/track the installation
  date, mark complete.

## Tech stack

- **Next.js 16.3**
- **Shadcn UI**
- **Supabase** (PostgreSQL, latest available version) for persistence and auth
- **Vercel AI SDK** + **AI Elements** — available for AI-assisted features (not required for the
  four initial features above; expect this to come into play for things like a quoting
  assistant or chat-driven lookups later)

## Architecture

**Functional Core, Imperative Shell** with **type-driven domain modeling**:

- Domain types and pure business logic (pricing, status transitions, validation) live in the
  functional core — no I/O, no framework code.
- Supabase calls, Next.js server actions/routes, and other side effects live in the imperative
  shell and stay thin: parse input, call the core, persist/return the result.
- Model the domain with closed type hierarchies (sum types) and immutable data first; write the
  types before the database schema or the UI.

## UI patterns

- **Dialog** for short, focused forms (a handful of fields, e.g. Customers, Products) — an
  in-and-out task that doesn't need much room.
- **Drawer** for forms with repeating line items or many fields (e.g. Quotes, Orders) — needs
  space to grow without feeling cramped, and keeps the underlying list visible for context.
- **AlertDialog** for every destructive confirmation (delete), regardless of entity complexity.

## Project structure

App code lives under `src/` (`src/app`, `src/components`, `src/core`, `src/features`,
`src/lib`, `src/hooks`); `@/*` resolves to `src/*`. `public/` and `supabase/` stay at the repo
root, per convention.

## Available agent skills

Use these proactively when the task matches, rather than improvising the equivalent by hand:

- `emc-pragmatic-type-driven-domain-modeling` — modeling a new entity, status/lifecycle field, or
  workflow step (e.g. quote status, order status) as types instead of flags/enums with
  ad-hoc checks.
- `emc-fcis-nextjs-feature-slice` — implementing a feature's business logic as a Server
  Action with Core/Shell split.
- `supabase` — anything touching Supabase (schema, RLS, auth, client setup, migrations).
- `supabase-postgres-best-practices` — load before writing/altering any table, RLS policy,
  index, or query — including a one-column change.
- `shadcn` — adding or customizing shadcn components.
- `vercel-react-best-practices` — writing or reviewing React/Next.js components for
  performance patterns.
- `ai-sdk` — once an AI-powered feature is in scope (generation, chat, tool calling).
- `playwright-cli` — verifying UI changes actually work in a running browser before calling a
  UI task done.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
