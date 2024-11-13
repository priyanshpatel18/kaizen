import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    const user = await getUserData(session);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        userWorkspace: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        projects: {
          include: {
            categories: {
              include: {
                tasks: {
                  orderBy: {
                    position: "asc",
                  },
                },
              },
              orderBy: {
                position: "asc",
              },
            }
          }
        }
      }
    });

    if (!workspaces) {
      return NextResponse.json({ message: "Workspaces not found" }, { status: 404 });
    }

    return NextResponse.json({ workspaces });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}