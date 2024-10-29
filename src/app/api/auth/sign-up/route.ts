import prisma from "@/db";
import { signUpSchema } from "@/zod/user";
import { User } from "@prisma/client";
import { genSalt, hash } from "bcrypt";
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
  try {
    // Validate Request
    const body = await request.json();
    const { email, password } = await signUpSchema.parseAsync(body);

    // Check if user exists and if it has EMAIL account
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

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
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
