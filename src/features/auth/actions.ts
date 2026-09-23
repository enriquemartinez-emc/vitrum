"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { SignInFormState } from "@/features/auth/form-state"
import { DEMO_SESSION_TOKEN, SESSION_COOKIE } from "@/features/auth/session"
import { DEMO_USER } from "@/lib/demo-user"

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
})

export async function signInAction(
  _prevState: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (
    !parsed.success ||
    parsed.data.email !== DEMO_USER.email ||
    parsed.data.password !== DEMO_USER.password
  ) {
    return { status: "error", message: "Incorrect email or password." }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, DEMO_SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  redirect("/dashboard")
}

export async function signOutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)

  redirect("/login")
}
