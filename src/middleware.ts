import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lewatkan request Next.js static, internal assets, images, icons, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // 2. Selalu izinkan rute auth API Better Auth (/api/auth/*)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 3. Rute /login dialihkan ke /admin/login
  if (pathname === "/login") {
    const loginUrl = new URL("/admin/login", request.url);
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
      loginUrl.searchParams.set("callbackUrl", callbackUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. Periksa cookie sesi Better Auth
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const isAuthenticated = Boolean(sessionCookie?.value);

  // 5. Halaman login (/admin/login)
  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      const callbackUrl =
        request.nextUrl.searchParams.get("callbackUrl") || "/";
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.next();
  }

  // 6. Root /admin dialihkan ke dashboard
  if (pathname === "/admin") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", "/admin/dashboard");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // 7. PROTEKSI SELURUH APLIKASI (WHOLE APP PROTECTION):
  // Jika pengunjung belum login, blokir akses ke seluruh halaman & API
  if (!isAuthenticated) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Unauthorized: Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    const currentPathWithQuery = pathname + request.nextUrl.search;
    loginUrl.searchParams.set("callbackUrl", currentPathWithQuery);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
