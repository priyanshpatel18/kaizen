import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const publicPages = ["/sign-up", "/sign-in", "/forgot-password"];
const restrictedPages = ["/reset-password"];

export default withAuth(
  async (req) => {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isPublic = publicPages.includes(req.nextUrl.pathname);
    const isRestricted = restrictedPages.includes(req.nextUrl.pathname);

    // Get the attempted URL
    const attemptedUrl = req.nextUrl.pathname + req.nextUrl.search;

    // Redirect "/" to "/app/today" if accessed
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/app/today", req.url));
    }

    // Restrict access to public pages if authenticated
    if (isAuth && isPublic) {
      return NextResponse.redirect(new URL("/app/today", req.url));
    }

    // Restrict access to restricted pages
    if (isRestricted) {
      return NextResponse.redirect(new URL("/app/today", req.url));
    }

    // Handle onboarded users trying to access /onboard/* routes
    const onboardedCookie = (await cookies()).get("onboarded");

    if (req.nextUrl.pathname.startsWith("/onboard/")) {
      // Redirect if onboarded
      if (onboardedCookie?.value === "true") {
        return NextResponse.redirect(new URL("/app/today", req.url));
      } else {
        return NextResponse.next();
      }
    }

    // Allow public pages if not authenticated
    if (isPublic) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to the sign-in page with returnUrl
    if (!isAuth) {
      const redirectUrl = new URL("/sign-in", req.url);
      redirectUrl.searchParams.set("returnUrl", attemptedUrl);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/app/inbox",
    "/app/today",
    "/labels",
    "/onboard/profile",
    "/onboard/use-case",
    "/projects",
    "/projects/:projectId",
    "/test",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
  ],
};
