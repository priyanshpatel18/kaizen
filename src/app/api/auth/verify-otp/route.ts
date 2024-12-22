import OnboardingTemplate from "@/components/emailTemplates/OnboardingTemplate";
import prisma from "@/db";
import { decryptData, encryptData } from "@/lib/encrypt";
import { sendMail } from "@/lib/resend";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Workflow:
// 1. Verify Schema
// 2. Verify OTP
// 3. If `signUpFlag` is true
//      Retrieve token from cookies.
//      Decrypt the token.
//      Ensure token is valid and has the correct structure.
//      Update the user's `isVerified` field.
//      Send a Welcome email.
//      Set a cookie to indicate the sidebar is open.
// 4. Return Response Message

interface EncryptedUser {
  email: string;
  password: string;
}

function isEncryptedUser(obj: unknown): obj is EncryptedUser {
  return typeof obj === "object" && obj !== null && "email" in obj && "password" in obj;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { otp } = await z.object({ otp: z.string() }).parseAsync(body);

  if (!otp) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    // Verify OTP
    const verify = await prisma.otp.findFirst({
      where: {
        code: otp,
      },
    });
    if (!verify || verify.expiresAt < new Date() || verify.code !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (body.signUpFlag === true) {
      const token = cookies().get("user")?.value;
      if (!token) {
        return NextResponse.json({ message: "Token not found" }, { status: 400 });
      }

      // Decrypt token and assert the payload type
      const decryptedToken = await decryptData(token as string);

      if (!decryptedToken || !decryptedToken.payload) {
        return NextResponse.json({ message: "Invalid token" }, { status: 400 });
      }

      // Cast to EncryptedUser after verifying the structure
      const decryptToken = decryptedToken.payload as unknown;
      if (!isEncryptedUser(decryptToken)) {
        return NextResponse.json({ message: "Invalid token structure" }, { status: 400 });
      }

      const user = await prisma.user.update({
        where: { email: decryptToken.email },
        data: { isVerified: true },
      });

      await sendMail(decryptToken.email, "Welcome to Kaizen", OnboardingTemplate());
      cookies().set({
        name: "sidebar:state",
        value: "true",
      });

      const encryptedUser = await encryptData({
        email: user.email,
        password: decryptToken.password,
      });

      return NextResponse.json({ message: "Account created successfully", user: encryptedUser }, { status: 200 });
    }

    await prisma.otp.deleteMany({
      where: { code: otp },
    });
    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
