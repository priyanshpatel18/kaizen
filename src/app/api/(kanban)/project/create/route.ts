import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const projects = formData.get("projects") as string;
    const flag = formData.get("usecaseFlag") as string;

    const name = formData.get("name") as string;
    const workspaceId = formData.get("workspaceId") as string;

    if (!projects && !flag && !name) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const user = await getUserData(session);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (projects && flag === "true") {
      const workspace = await prisma.workspace.findFirst({
        where: {
          userWorkspace: {
            some: {
              userId: user.id,
            },
          },
          isDefault: true,
        },
      });
      if (!workspace) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 400 });
      }

      const parsedProjects = JSON.parse(projects);
      if (!Array.isArray(parsedProjects)) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 400 });
      }

      for (const project of parsedProjects) {
        const newProject = await prisma.project.create({
          data: {
            name: project,
            workspaceId: workspace.id,
            userId: user.id,
          },
        });

        await prisma.category.create({
          data: {
            name: "default",
            isDefault: true,
            projectId: newProject.id,
          },
        });
      }

      (await cookies()).set("onboarded", "true");
      return NextResponse.json({ message: "Welcome to Kaizen" });
    }
    if (!workspaceId) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    if (name && workspaceId) {
      const project = await prisma.project.create({
        data: {
          name,
          workspaceId,
          userId: user.id,
        },
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
          },
        },
      });
      return NextResponse.json({ project, message: "Project created successfully" });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
