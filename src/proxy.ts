import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { isSignedIn, SESSION_COOKIE } from "@/features/auth/session"

export function proxy(request: NextRequest) {
  const signedIn = isSignedIn(request.cookies.get(SESSION_COOKIE)?.value)
  const { pathname } = request.nextUrl

  if (pathname === "/login") {
    return signedIn
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next()
  }

  if (signedIn) return NextResponse.next()

  if (pathname.startsWith("/api/")) {
    return new Response("Sign in required.", { status: 401 })
  }

  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/api/reports/:path*"],
}
