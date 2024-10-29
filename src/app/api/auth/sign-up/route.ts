import prisma from "@/db";
import { signUpSchema } from "@/zod/user";
import { genSalt, hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";

async function generateAndSendOtp(email: string) {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(otp);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Email Verification",
    text: `Your OTP is ${otp}`,
  };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail(mailOptions);
    return otp;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}

async function createUnverifiedAccount(email: string, hashedPassword: string) {
  const otp = await generateAndSendOtp(email);
  if (!otp) {
    throw new Error("Failed to send OTP. Check your email and try again");
  }

  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  console.log(otpExpiry);

  return prisma.unverifiedAccount.create({
    data: {
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate Request
    const body = await request.json();
    const { email, password } = await signUpSchema.parseAsync(body);
    console.log(email, password);

    // 2. Check if user exists and if it has EMAIL account
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true },
      });

      // 3. Hash password
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);

      if (user) {
        const hasEmailAccount = user.accounts.some(
          (account) => account.provider === "EMAIL"
        );

        if (hasEmailAccount) {
          throw new Error("Email already registered");
        }

        // 4. Send OTP and create an unverified account if user exists without EMAIL account
        return await createUnverifiedAccount(email, hashedPassword);
      }

      // 5. Create new unverified account if no user exists
      return await createUnverifiedAccount(email, hashedPassword);
    });

    return NextResponse.json(
      { message: "User created successfully", user: result },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0];
      const formattedMessage =
        firstError === "Required"
          ? `${Object.keys(fieldErrors)[0]
              .charAt(0)
              .toUpperCase()}${Object.keys(fieldErrors)[0].slice(
              1
            )} is required`
          : firstError || "Invalid input";

      return NextResponse.json({ message: formattedMessage }, { status: 400 });
    }

    // Handle known errors
    if (
      error instanceof Error &&
      error.message === "Email already registered"
    ) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Handle generic errors
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
