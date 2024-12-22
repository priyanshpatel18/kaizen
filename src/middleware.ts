import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const publicPages = ["/sign-up", "/sign-in", "/forgot-password"];

export default withAuth(
  async (req) => {
    const token = await getToken({ req });

    const isAuth = !!token;
    const isPublic = publicPages.includes(req.nextUrl.pathname);

    if (isPublic) {
      return NextResponse.next();
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const onBoarded = (await cookies()).get("onboarded");

    if (req.nextUrl.pathname === "/onboard/profile" && onBoarded && onBoarded.value === "true") {
      return NextResponse.redirect(new URL("/", req.url));
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
    "/inbox",
    "/labels",
    "/onboard/profile",
    "/onboard/use-case",
    "/projects",
    "/projects/:projectId",
    "/test",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
  ],
};
