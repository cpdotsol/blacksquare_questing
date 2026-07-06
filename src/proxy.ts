import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "session";

async function readSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return payload as { userId: string; role: "MEMBER" | "ADMIN" };
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSession(request);

  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if ((isAdminRoute || isDashboardRoute) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(
      new URL(session.role === "ADMIN" ? "/admin" : "/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
};
