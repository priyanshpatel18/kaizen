import { generateAndSendOtp } from "@/actions/emailService";
import prisma from "@/db";
import { decryptData } from "@/lib/encrypt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Workflow:
// 1. Verify Schema
// 2. If signUpFlag is true
//      Decrypt Data
//      Check if user already exists
// 3. Generate and send otp
// 4. Encrypt otp in cookies
// 5. Return Response Message

export async function POST(request: NextRequest) {
  const body = await request.json();
  let email = body.email;
  try {
    if (body.signUpFlag === true) {
      const { encryptedData } = body;
      if (!PRIVATE_KEY) return NextResponse.json({ message: "Something went wrong" }, { status: 500 });

      const decryptedBody = await decryptData(encryptedData, PRIVATE_KEY);

      email = decryptedBody.email;
      if (!email) {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true },
      });
      if (user && user.accounts.some((account) => account.provider === "EMAIL")) {
        return NextResponse.json({ message: "Email already exists" }, { status: 400 });
      }

      (await cookies()).set("user", encryptedData, { httpOnly: true, secure: true, maxAge: 60 * 5 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const otp = await generateAndSendOtp(email);
    if (!otp) {
      return NextResponse.json({ message: "Failed to send otp. Check your email and try again" }, { status: 500 });
    }

    return NextResponse.json({ message: `Email sent to ${email}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const formattedMessage = (() => {
        const firstErrorKey = Object.keys(fieldErrors)[0];
        if (!firstErrorKey) return "Invalid input";

        const firstError = fieldErrors[firstErrorKey]?.[0];
        if (firstError === "Required") {
          return `${firstErrorKey.charAt(0).toUpperCase()}${firstErrorKey.slice(1)} is required`;
        }
        return firstError || "Invalid input";
      })();

      return NextResponse.json({ message: formattedMessage }, { status: 400 });
    }

    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
