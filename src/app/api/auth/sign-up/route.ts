import OnboardingTemplate from "@/components/emailTemplates/OnboardingTemplate";
import prisma from "@/db";
import { sendMail } from "@/lib/resend";
import { verifySchema } from "@/zod/user";
import { User } from "@prisma/client";
import { compare, genSalt, hash } from "bcrypt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function createAccount(
  email: string,
  hashedPassword: string,
  user?: User
) {
  if (!user) {
    // Create new user if not found
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });
  } else {
    // Update existing user with hashed password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }

  // Create new account associated with user
  const newAccount = await prisma.account.create({
    data: {
      provider: "EMAIL",
      userId: user.id,
    },
  });

  return newAccount;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, otp } = await verifySchema.parseAsync(body);

  if (!email || !password || !otp) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const token = cookies().get("verificiation_token")?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Resent OTP and try again" },
      { status: 400 }
    );
  }

  try {
    const isVerified = compare(otp, token);
    if (!isVerified) {
      return NextResponse.json({ message: "Incorrect OTP" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true },
      });

      // Hash password
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);

      if (user) {
        const hasEmailAccount = user.accounts.some(
          (account) => account.provider === "EMAIL"
        );
        if (hasEmailAccount) {
          throw new Error("Email already registered");
        }

        return await createAccount(email, hashedPassword, user);
      }
      return await createAccount(email, hashedPassword);
    });

    if (!result) {
      return NextResponse.json(
        { message: "Failed to create account" },
        { status: 500 }
      );
    }

    // Send Onboarding email
    await sendMail(email, "Welcome to Kaizen", OnboardingTemplate());

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
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

    if (
      error instanceof Error &&
      error.message === "Email already registered"
    ) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
