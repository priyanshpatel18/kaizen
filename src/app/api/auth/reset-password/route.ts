import prisma from "@/db";
import { forgotPasswordSchema } from "@/zod/user";
import { hash } from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Workflow:
// 1. Verify Schema
// 2. Verify OTP
// 3. Find User
// 4. Hash Password
// 5. Update Password
// 6. Return Response Message

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, otp } = await forgotPasswordSchema.parseAsync(body);

  if (!password || !otp) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const verify = await prisma.otp.findFirst({
      where: {
        code: otp,
      },
    });
    if (!verify || verify.expiresAt < new Date() || verify.code !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }
    await prisma.otp.delete({
      where: {
        id: verify.id,
      },
    });

    const user = await prisma.user.findFirst({
      where: { email: verify.email },
      include: { accounts: true },
    });

    if (user) {
      const hasAccount = user.accounts.some((account) => account.provider === "EMAIL");

      if (hasAccount) {
        // Hash password
        const hashedPassword = await hash(password);

        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        return NextResponse.json({ message: "Password Reset Successfully" });
      }

      return NextResponse.json({ message: "Try again with Google sign in" }, { status: 400 });
    }

    return NextResponse.json({ message: "Account doesn't exist" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const formattedMessage = (() => {
        if (fieldErrors.email) {
          return fieldErrors.email[0];
        }
        if (fieldErrors.password) {
          return fieldErrors.password[0];
        }
        if (fieldErrors.otp) {
          return fieldErrors.otp[0];
        }
        return "Something went wrong";
      })();
      return NextResponse.json({ message: formattedMessage }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Email already registered") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
