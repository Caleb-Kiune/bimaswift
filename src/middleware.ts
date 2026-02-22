import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {

    const check = request.cookies.has('agent_session')
    if (!check) {
      return  NextResponse.redirect(new URL ('/', request.url))
    }
}

export const config = {
    matcher: '/dashboard/:path*'
}