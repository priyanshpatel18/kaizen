import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ message: "Workspace name is required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  try {
    const user = await getUserData(session);

    if (!user) {
      return NextResponse.json({ message: "Please sign-in first to continue" }, { status: 401 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        userWorkspace: {
          create: {
            userId: user.id,
          },
        },
      },
      include: {
        projects: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ message: "Error creating workspace" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Created workspace successfully",
      workspace,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create workspace" }, { status: 500 });
  }
}
