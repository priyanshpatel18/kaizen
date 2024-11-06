import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/(.*)"],
};

export default withAuth(async (req) => {
  console.log("token", req.nextauth.token);

  const token = req.nextauth.token;
  if (!token) {
    return NextResponse.redirect(new URL("/invalidsession", req.url));
  }

  return NextResponse.next();
});