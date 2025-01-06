import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const publicPages = ["/sign-up", "/sign-in", "/forgot-password", "/reset-password", "/verify-otp"];

export default withAuth(
  async (req) => {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isPublic = publicPages.includes(req.nextUrl.pathname);

    // Get the attempted URL
    const attemptedUrl = req.nextUrl.pathname + req.nextUrl.search;

    // Handle onboarded users trying to access /onboard/* routes
    const onboardedCookie = (await cookies()).get("onboarded");

    if (req.nextUrl.pathname.startsWith("/app/onboard/")) {
      // Redirect if onboarded
      if (onboardedCookie?.value === "true") {
        return NextResponse.redirect(new URL("/app/today", req.url));
      }
    }

    // Allow public pages if not authenticated
    if (!isAuth && isPublic) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to the sign-in page with returnUrl for all non-public pages
    if (!isAuth) {
      const redirectUrl = new URL("/sign-in", req.url);
      redirectUrl.searchParams.set("returnUrl", attemptedUrl);
      return NextResponse.redirect(redirectUrl);
    }

    // Restrict access to public pages if authenticated
    if (isAuth && isPublic) {
      return NextResponse.redirect(new URL("/app/today", req.url));
    }

    // Redirect "/" to "/app/today" if accessed and authenticated
    if (req.nextUrl.pathname === "/" && isAuth) {
      return NextResponse.redirect(new URL("/app/today", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized() {
        return true; // Always allow middleware to run for processing
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/app/:path*",
    "/labels",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
  ],
};
