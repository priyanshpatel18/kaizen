import OnboardingTemplate from "@/components/emailTemplates/OnboardingTemplate";
import prisma from "@/db";
import { sendMail } from "@/lib/resend";
import { verifySchema } from "@/zod/user";
import { compare, genSalt, hash } from "bcrypt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    const isVerified = await compare(otp, token);
    if (!isVerified) {
      return NextResponse.json({ message: "Incorrect OTP" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Find User
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

        // Create a new account for the existing user
        return prisma.account.create({
          data: {
            provider: "EMAIL",
            userId: user.id,
          },
        });
      }

      // Create a new user if not found
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          isVerified: true,
        },
      });

      // Create a workspace for the new user
      const workspace = await prisma.workspace.create({
        data: {
          name: "My Projects",
          userWorkspace: {
            create: {
              userId: newUser.id,
            },
          },
          isDefault: true,
        },
      });

      if (!workspace) {
        throw new Error("Something went wrong, please try again");
      }

      // Return the created user account
      return prisma.account.create({
        data: {
          provider: "EMAIL",
          userId: newUser.id,
        },
      });
    });

    if (result && result.userId) {
      await sendMail(email, "Welcome to Kaizen", OnboardingTemplate());

      cookies().delete("verificiation_token");
      cookies().set({
        name: "sidebar:state",
        value: "true",
      });

      return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 }
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

    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
