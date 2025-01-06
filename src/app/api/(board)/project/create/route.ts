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

    if (!projects && !name) {
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

      let resProjects = [];

      for (const project of parsedProjects) {
        const newProject = await prisma.project.create({
          data: {
            name: project,
            workspaceId: workspace.id,
            userId: user.id,
            categories: {
              create: {
                name: "default",
                isDefault: true,
              },
            },
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
            workspace: true,
          },
        });

        resProjects.push(newProject);
      }

      (await cookies()).set("onboarded", "true");

      resProjects = resProjects.map((project) => {
        return {
          id: project.id,
          name: project.name,
          isDefault: project.isDefault,
          categoryIds: project.categories.map((category) => category.id),
          workspaceId: project.workspaceId,
          categories: project.categories,
          workspace: project.workspace,
        };
      });

      return NextResponse.json({ message: "Welcome to Kaizen", projects: resProjects });
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
          categories: {
            create: {
              name: "default",
              isDefault: true,
            },
          },
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
          workspace: true,
        },
      });

      const responseProject = {
        id: project.id,
        name: project.name,
        isDefault: project.isDefault,
        categoryIds: project.categories.map((category) => category.id),
        workspaceId: project.workspaceId,
        categories: project.categories,
        workspace: project.workspace,
      };

      return NextResponse.json({ project: responseProject, message: "Project created successfully" });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
