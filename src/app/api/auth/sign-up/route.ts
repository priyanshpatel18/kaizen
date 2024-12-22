import prisma from "@/db";
import { decryptData } from "@/lib/encrypt";
import { signUpSchema } from "@/zod/user";
import { hash } from "argon2";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Workflow:
// 1. Decrypt Data
// 2. Verify Schema

// Transaction Workflow:
//    1. Find User
//    2. Hash Password
//    3. If User Doesn't Exist
//         Create User

//    4. Create a workspace for the new user
//    5. Create and return a new account for the user

// 3. Send Welcome Email if successful txn
// 4. Return Response Message

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { encryptedData } = body;
  const decryptedBody = await decryptData(encryptedData);

  const { email, password } = await signUpSchema.parseAsync(decryptedBody.payload);
  if (!email || !password) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Find User
      let user = await prisma.user.findFirst({
        where: { email },
      });

      // Hash password
      const hashedPassword = await hash(password);

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            isVerified: false,
          },
        });
      }

      // // Create a workspace for the new user
      const workspace = await prisma.workspace.create({
        data: {
          name: "My Projects",
          userWorkspace: {
            create: {
              userId: user.id,
            },
          },
          isDefault: true,
        },
      });

      if (!workspace) {
        throw new Error("Something went wrong, please try again");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });
      // Return the created user account
      return prisma.account.create({
        data: {
          provider: "EMAIL",
          userId: user.id,
        },
      });
    });
    (await cookies()).set("user", encryptedData);

    if (result && result.userId) {
      return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    }

    return NextResponse.json({ message: "Failed to create account" }, { status: 500 });
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
        return "Something went wrong";
      })();
      return NextResponse.json({ message: formattedMessage }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Email already registered") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
