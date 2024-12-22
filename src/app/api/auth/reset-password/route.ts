import prisma from "@/db";
import { forgotPasswordSchema } from "@/zod/user";
import { compare, genSalt, hash } from "bcrypt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, otp } = await forgotPasswordSchema.parseAsync(body);

  if (!email || !password || !otp) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email },
      include: { accounts: true },
    });

    if (user) {
      const hasAccount = user.accounts.some((account) => account.provider === "EMAIL");

      if (hasAccount) {
        const token = cookies().get("verificiation_token")?.value;
        if (!token) {
          return NextResponse.json({ message: "Resent OTP and try again" }, { status: 400 });
        }

        const isVerified = compare(otp, token);
        if (!isVerified) {
          return NextResponse.json({ message: "Incorrect OTP" }, { status: 400 });
        }

        // Hash password
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);

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
