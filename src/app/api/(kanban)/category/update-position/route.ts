import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const { projectId, sourceColumnId, destinationColumnId, newPosition } = body;

  if (!projectId || !sourceColumnId || !destinationColumnId || typeof newPosition !== "number") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  try {
    const user = getUserData(session);
    if (!user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        categories: {
          include: {
            tasks: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const sourceColumn = project.categories.find((column) => column.id === sourceColumnId);
    const destinationColumn = project.categories.find((column) => column.id === destinationColumnId);
    if (!sourceColumn || !destinationColumn) {
      return NextResponse.json({ message: "Source or destination column not found" }, { status: 404 });
    }

    if (newPosition < 0 || newPosition > project.categories.length) {
      return NextResponse.json({ message: "Invalid position" }, { status: 400 });
    }

    let updatedPosition;

    if (newPosition + 1 === project.categories.length) {
      updatedPosition = (destinationColumn.position * 2 + 10) / 2;
    } else if (newPosition === 0) {
      updatedPosition = destinationColumn.position / 2;
    } else {
      if (sourceColumn.position > destinationColumn.position) {
        updatedPosition = (project.categories[newPosition - 1].position + project.categories[newPosition].position) / 2;
      } else {
        updatedPosition = (project.categories[newPosition + 1].position + project.categories[newPosition].position) / 2;
      }
    }

    await prisma.category.update({
      where: {
        id: sourceColumnId,
      },
      data: {
        position: updatedPosition,
      },
    });

    return NextResponse.json({ message: "Position updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
