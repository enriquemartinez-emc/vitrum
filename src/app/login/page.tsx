import Link from "next/link"
import { CommandIcon } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CommandIcon className="size-4" />
            </div>
            Vitrum
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden flex-col items-center justify-center gap-8 bg-muted p-10 lg:flex">
        <div
          aria-hidden
          className="grid size-64 grid-cols-2 gap-2 rounded-lg bg-foreground/15 p-2"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="rounded-sm bg-linear-to-br from-primary/25 to-background/60"
            />
          ))}
        </div>
        <p className="max-w-xs text-center text-lg font-medium text-balance">
          Quotes, orders, and installations for your window shop, in one place.
        </p>
      </div>
    </div>
  )
}
