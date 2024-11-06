import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();
  const projectId = body.projectId;
  const sourceColumnId = body.sourceColumnId;
  const destinationColumnId = body.destinationColumnId;
  const taskId = body.taskId;
  const newPosition = body.newPosition;

  if (
    !projectId ||
    !sourceColumnId ||
    !destinationColumnId ||
    typeof newPosition !== "number"
  ) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  try {
    const user = getUserData(session);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        categories: {
          include: {
            tasks: true,
          },
        },
      },
    });
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    const sourceColumn = project.categories.find(
      (category) => category.id === sourceColumnId
    );
    const destinationColumn = project.categories.find(
      (category) => category.id === destinationColumnId
    );
    if (!sourceColumn || !destinationColumn) {
      return NextResponse.json(
        { message: "Source or destination column not found" },
        { status: 404 }
      );
    }

    const task = sourceColumn.tasks.find((task) => task.id === taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Sort tasks in the destination column by position
    const sortedDestinationTasks = [...destinationColumn.tasks].sort(
      (a, b) => a.position - b.position
    );
    if (newPosition === -1) {
      await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          position: (sortedDestinationTasks.length + 1) * 10,
          categoryId: destinationColumnId,
        },
      });
      return NextResponse.json(
        { message: "Position updated successfully" },
        { status: 200 }
      );
    }

    // Ensure the new position is within bounds
    if (newPosition < 0 || newPosition > sortedDestinationTasks.length) {
      return NextResponse.json(
        { message: "Invalid position" },
        { status: 400 }
      );
    }

    let updatedPosition;

    if (
      !sortedDestinationTasks[newPosition + 1] ||
      !sortedDestinationTasks[newPosition + 1].position
    ) {
      // Missing Below
      updatedPosition =
        (sortedDestinationTasks[newPosition].position * 2 + 10) / 2;
    } else if (
      !sortedDestinationTasks[newPosition - 1] ||
      !sortedDestinationTasks[newPosition - 1].position
    ) {
      // Missing Above
      updatedPosition = sortedDestinationTasks[newPosition].position / 2;
    } else {
      // Both Above and Below
      if (task.position > sortedDestinationTasks[newPosition].position) {
        updatedPosition =
          (sortedDestinationTasks[newPosition].position +
            sortedDestinationTasks[newPosition - 1].position) /
          2;
      } else {
        updatedPosition =
          (sortedDestinationTasks[newPosition + 1].position +
            sortedDestinationTasks[newPosition].position) /
          2;
      }
    }

    // Ensure updated position is within valid bounds
    updatedPosition = Math.max(
      updatedPosition,
      sortedDestinationTasks[0].position + 0.1
    );
    updatedPosition = Math.min(
      updatedPosition,
      sortedDestinationTasks[sortedDestinationTasks.length - 1].position - 0.1
    );

    await prisma.task.update({
      where: { id: task.id },
      data: {
        position: updatedPosition,
        categoryId: destinationColumnId,
      },
    });

    return NextResponse.json(
      { message: "Position updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating task position" },
      { status: 500 }
    );
  }
}
