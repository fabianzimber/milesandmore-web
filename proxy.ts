import { NextResponse } from "next/server"; 
import { auth } from "./src/auth";

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname === "/admin/signin") {
    return NextResponse.next();
  }

  if (!request.auth?.user?.id) {
    return NextResponse.redirect(new URL("/admin/signin", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
