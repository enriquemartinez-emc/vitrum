# Vitrum

A web app for running a window shop: quote custom windows, turn approved quotes into orders, and track installations.

**Live app:** https://vitrum-alpha.vercel.app

## How it works

1. A **customer** requests a **quote** for one or more windows, priced by window type, glass type, size, quantity, and labor.
2. The customer **approves** or **declines** the quote. Declined quotes are kept for history.
3. An approved quote becomes an **order** with an agreed **installation date**.
4. Once installed, the order is marked **complete**.

## Features

### AI-powered

- **Quote drafting** — describe a job in plain language ("2 double-hung 24x36 low-e for Maria Gonzalez") and get a draft quote with the customer and line items filled in, ready to review and price.
- **Business reports chat** — ask questions like "what were our best-selling glass types last month?" and get answers from live revenue, order, and customer data.
- **Inventory reorder digest** — a written summary of which glass types are running short for pending quotes, and what to reorder first.

### Core tools

- **Dashboard** — glass sales over time by glass type, pending orders, and at-a-glance order and inventory alerts.
- **Customers** — add, edit, and remove customers.
- **Products** — window types, glass types, and labor cost presets.
- **Quotes** — build priced quotes with multiple line items and record the customer's decision.
- **Orders** — create orders from approved quotes, schedule installation, and mark them complete.
- **Inventory** — track glass stock levels.
