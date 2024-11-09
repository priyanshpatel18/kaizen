import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const user = await getUserData(session);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        userId: user.id,
        categories: {
          create: {
            name: "Untitled",
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
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Something went wrong, please try again" },
        { status: 500 }
      );
    }

    const projectResponse = {
      ...project,
      categories: project.categories.map((category) => ({
        ...category,
        tasks: category.tasks || [],
      })),
    };

    return NextResponse.json({
      message: "Project created successfully",
      project: projectResponse,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
