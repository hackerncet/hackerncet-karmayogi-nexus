import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isWorkspacePath } from "@/lib/routes";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const publicPaths = [
    "/",
    "/features",
    "/how-it-works",
    "/accessibility",
    "/privacy",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/unauthorized",
    "/not-found",
    "/auth/callback",
  ];
  const demoPath =
    path === "/demo" || path === "/demo/" || path.startsWith("/demo/");
  const valid =
    publicPaths.includes(path) ||
    path.startsWith("/api/") ||
    (demoPath
      ? path === "/demo" || path === "/demo/" || isWorkspacePath(path.slice(5))
      : isWorkspacePath(path));
  if (!valid)
    return NextResponse.rewrite(new URL("/not-found", request.url), {
      status: 404,
    });
  if (
    demoPath ||
    [
      "/",
      "/features",
      "/how-it-works",
      "/accessibility",
      "/privacy",
      "/not-found",
    ].includes(path)
  )
    return response;
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    return isWorkspacePath(path)
      ? NextResponse.redirect(new URL("/login", request.url))
      : response;
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(items) {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          response.headers.set("Cache-Control", "private, no-store");
        },
      },
    },
  );
  const { data, error } = await db.auth.getClaims();
  if (isWorkspacePath(path) && (error || !data?.claims)) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)",
  ],
};
