import { generateAndSendOtp } from "@/actions/emailService";
import prisma from "@/db";
import { generateToken } from "@/lib/encrypt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Workflow:
// 1. Verify Schema
// 2. If signUpFlag is true
//      Check if user already exists
// 3. Generate and send otp
// 4. Encrypt otp in cookies
// 5. Return Response Message

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { email } = await z
    .object({ email: z.string().email() })
    .parseAsync(body);

  try {
    if (body.signUpFlag === true) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true },
      });
      if (user && user.accounts.some((account) => account.provider === "EMAIL")) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 }
        );
      }
    }

    const otp = await generateAndSendOtp(email);
    if (!otp) {
      return NextResponse.json(
        { message: "Failed to send otp. Check your email and try again" },
        { status: 500 }
      );
    }

    // Delete Invalid OTP
    await prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return NextResponse.json({ message: `Email sent to ${email}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const formattedMessage = (() => {
        const firstErrorKey = Object.keys(fieldErrors)[0];
        if (!firstErrorKey) return "Invalid input";

        const firstError = fieldErrors[firstErrorKey]?.[0];
        if (firstError === "Required") {
          return `${firstErrorKey.charAt(0).toUpperCase()}${firstErrorKey.slice(
            1
          )} is required`;
        }
        return firstError || "Invalid input";
      })();

      return NextResponse.json({ message: formattedMessage }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
