import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "./lib/adminAuth";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "./lib/merchantAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/merchant") || pathname.startsWith("/api/merchant")) {
    const isLoginPage = pathname === "/merchant/login";
    const isLoginApi = pathname === "/api/merchant/login";
    if (isLoginPage || isLoginApi) {
      return NextResponse.next();
    }

    const token = request.cookies.get(MERCHANT_SESSION_COOKIE)?.value;
    const session = await verifyMerchantSession(token);

    if (!session) {
      if (pathname.startsWith("/api/merchant")) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/merchant/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authed = await isValidSessionToken(token);

  if (!authed) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/merchant/:path*", "/api/merchant/:path*"],
};
