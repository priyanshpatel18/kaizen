import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        userWorkspace: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        projects: {
          include: {
            workspace: true,
            categories: {
              include: {
                tasks: {
                  orderBy: {
                    position: "asc",
                  },
                  where: {
                    isCompleted: false,
                  },
                },
                project: true,
              },
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    if (!workspaces) {
      return NextResponse.json({ message: "Workspaces not found" }, { status: 404 });
    }

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
