import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();
  const {
    projectId,
    sourceColumnId,
    destinationColumnId,
    taskId,
    newPosition,
  } = body;

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
    const user = await getUserData(session);
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

    const sortedDestinationTasks = [...destinationColumn.tasks].sort(
      (a, b) => a.position - b.position
    );
    if (newPosition > sortedDestinationTasks.length) {
      return NextResponse.json(
        { message: "Invalid position" },
        { status: 400 }
      );
    }

    let updatedPosition: number;
    if (newPosition === -1) {
      updatedPosition = (sortedDestinationTasks.length + 1) * 1000;
    } else if (
      !sortedDestinationTasks[newPosition + 1] ||
      !sortedDestinationTasks[newPosition + 1].position
    ) {
      updatedPosition =
        (sortedDestinationTasks[newPosition].position * 2 + 1000) / 2;
    } else if (
      !sortedDestinationTasks[newPosition - 1] ||
      !sortedDestinationTasks[newPosition - 1].position
    ) {
      updatedPosition = sortedDestinationTasks[newPosition].position / 2;
    } else {
      updatedPosition =
        task.position > sortedDestinationTasks[newPosition].position
          ? (sortedDestinationTasks[newPosition].position +
              sortedDestinationTasks[newPosition - 1].position) /
            2
          : (sortedDestinationTasks[newPosition + 1].position +
              sortedDestinationTasks[newPosition].position) /
            2;
    }

    const transaction = await prisma.$transaction(async (prisma) => {
      const conflicts = sortedDestinationTasks.filter(
        (t) => t.position === updatedPosition
      );

      if (conflicts.length > 0 || destinationColumn.reorderCount + 1 > 20) {
        const reorderCount = await prisma.category.update({
          where: { id: destinationColumnId },
          data: { reorderCount: 0 },
        });

        let newSortedDestinationTasks = sortedDestinationTasks.map((task) => {
          if (task.id === taskId) task.position = updatedPosition;
          return task;
        });

        if (conflicts.length === 0) {
          newSortedDestinationTasks = newSortedDestinationTasks.sort(
            (a, b) => a.position - b.position
          );
        }

        const taskUpdates = newSortedDestinationTasks.map((task, index) =>
          prisma.task.update({
            where: { id: task.id },
            data: {
              position: (index + 1) * 1000,
              categoryId: destinationColumnId,
            },
          })
        );

        await Promise.all(taskUpdates);

        if (!reorderCount || !taskUpdates) {
          return null;
        }

        if (conflicts.length > 0) {
          throw new Error("Task position conflict");
        }

        return reorderCount;
      }

      const taskUpdate = await prisma.task.update({
        where: { id: task.id },
        data: {
          position: updatedPosition,
          categoryId: destinationColumnId,
        },
      });

      const reorderCount = await prisma.category.update({
        where: { id: destinationColumnId },
        data: {
          reorderCount: { increment: 1 },
        },
      });

      if (!taskUpdate || !reorderCount) return null;

      return reorderCount;
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Something went wrong, please try again" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Position updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT request:", error);
    return NextResponse.json(
      { message: "Error updating task position" },
      { status: 500 }
    );
  }
}
