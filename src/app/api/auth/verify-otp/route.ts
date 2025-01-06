import OnboardingTemplate from "@/components/emailTemplates/OnboardingTemplate";
import prisma from "@/db";
import { decryptData } from "@/lib/encrypt";
import { sendMail } from "@/lib/resend";
import { hash } from "argon2";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

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
      const token = (await cookies()).get("user")?.value;
      if (!token) {
        return NextResponse.json({ message: "Token not found" }, { status: 400 });
      }

      const result = await prisma.$transaction(async (prisma) => {
        // Decrypt token
        const decryptedToken = (await decryptData(token as string, PRIVATE_KEY as string)) as EncryptedUser;
        if (!decryptedToken) {
          return null;
        }

        // Find User
        let user = await prisma.user.findFirst({
          where: { email: decryptedToken.email },
          include: { accounts: true },
        });

        // If user does not exist, create a new user
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: decryptedToken.email,
              password: await hash(decryptedToken.password),
              isVerified: true,
              accounts: {
                create: {
                  provider: "EMAIL",
                },
              },
            },
            include: { accounts: true },
          });
        } else {
          user = await prisma.user.update({
            where: { email: decryptedToken.email },
            data: {
              isVerified: true,
              accounts: {
                create: {
                  provider: "EMAIL",
                },
              },
              password: await hash(decryptedToken.password),
            },
            include: { accounts: true },
          });
        }

        // Create Workspace
        const workspace = await prisma.workspace.create({
          data: {
            name: "My Projects",
            isDefault: true,
            userWorkspace: {
              create: {
                userId: user.id,
              },
            },
          },
        });
        if (!workspace) return null;

        const newProject = await prisma.project.create({
          data: {
            name: "Inbox",
            workspaceId: workspace.id,
            userId: user.id,
            isDefault: true,
          },
        });
        if (!newProject) return null;

        const defaultCategory = await prisma.category.create({
          data: {
            name: "default",
            isDefault: true,
            projectId: newProject.id,
          },
        });
        if (!defaultCategory) return null;

        return user;
      });

      if (!result || !result.email) {
        console.log("Error: User does not have a valid email or result is null");
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
      }

      await sendMail(result.email, "Welcome to Kaizen", OnboardingTemplate());
      (await cookies()).set({
        name: "sidebar:state",
        value: "true",
      });
      (await cookies()).delete({
        name: "user",
      });

      return NextResponse.json({ message: "Account created successfully" }, { status: 200 });
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
