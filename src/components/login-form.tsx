"use client"

import { useActionState } from "react"
import { InfoIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signInAction } from "@/features/auth/actions"
import type { SignInFormState } from "@/features/auth/form-state"
import { DEMO_USER } from "@/lib/demo-user"
import { cn } from "@/lib/utils"

export function LoginForm({
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "action">) {
  const [state, formAction, isPending] = useActionState<
    SignInFormState,
    FormData
  >(signInAction, { status: "idle" })
  const hasError = state.status === "error"

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={formAction}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Sign in to manage quotes, orders, and installations
          </p>
        </div>
        <Field data-invalid={hasError}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            aria-invalid={hasError}
            required
          />
        </Field>
        <Field data-invalid={hasError}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={hasError}
            required
          />
          {hasError && <FieldError>{state.message}</FieldError>}
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            Sign in
          </Button>
        </Field>
        <Alert>
          <InfoIcon />
          <AlertTitle>Demo credentials</AlertTitle>
          <AlertDescription>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <dt>Email:</dt>
              <dd className="font-mono">{DEMO_USER.email}</dd>
              <dt>Password:</dt>
              <dd className="font-mono">{DEMO_USER.password}</dd>
            </dl>
          </AlertDescription>
        </Alert>
      </FieldGroup>
    </form>
  )
}
