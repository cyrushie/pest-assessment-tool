import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyTokenForMiddleware } from "./lib/auth-middleware"

export async function middleware(request: NextRequest) {
  // Protect analytics routes
  if (request.nextUrl.pathname.startsWith("/analytics")) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const userId = verifyTokenForMiddleware(token)
    if (!userId) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/analytics/:path*"],
}
