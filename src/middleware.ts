import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Periksa cookie sesi Better Auth
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const isAuthenticated = Boolean(sessionCookie?.value);

  // 2. Halaman login admin (/admin/login)
  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      const callbackUrl =
        request.nextUrl.searchParams.get("callbackUrl") || "/admin/dashboard";
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.next();
  }

  // 3. Root /admin diarahkan ke /admin/dashboard jika sudah login, atau ke /admin/login jika belum
  if (pathname === "/admin") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", "/admin/dashboard");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // 4. Proteksi rute API admin (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized: Silakan login terlebih dahulu sebagai admin" },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // 5. Proteksi seluruh halaman admin lainnya (/admin/*)
  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    const currentPathWithQuery = pathname + request.nextUrl.search;
    loginUrl.searchParams.set("callbackUrl", currentPathWithQuery);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
