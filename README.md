# Vitrum

A window shop business app: quoting, ordering, and installation tracking. Built with Next.js, shadcn/ui, and Supabase.

## Local development

This project uses a local Supabase instance (Postgres) via the Supabase CLI and Docker.

```bash
npx supabase start   # prints your local API URL and keys
cp .env.example .env.local
# fill in SUPABASE_URL and SUPABASE_SECRET_KEY from the `supabase start` output
npm run dev
```

If port 54321+ is already taken by another local Supabase project on your machine, edit the port numbers in `supabase/config.toml` before running `supabase start`.

Schema changes live in `supabase/migrations/`; seed data lives in `supabase/seed.sql`. Run `npx supabase db reset --local` to reapply both against a fresh local database.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
