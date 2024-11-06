import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
    !taskId ||
    typeof newPosition !== "number"
  ) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
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
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
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
  const sortedTasks = [...destinationColumn.tasks].sort(
    (a, b) => a.position - b.position
  );

  // Ensure the new position is within bounds
  if (newPosition < 0 || newPosition >= sortedTasks.length) {
    return NextResponse.json({ message: "Invalid position" }, { status: 400 });
  }

  const taskIndex = sortedTasks.findIndex((t) => t.id === task.id);
  if (taskIndex === -1) {
    return NextResponse.json(
      { message: "Task not found in the destination column" },
      { status: 404 }
    );
  }

  let updatedPosition;

  if (!sortedTasks[newPosition + 1] || !sortedTasks[newPosition + 1].position) {
    // Missing Below
    updatedPosition = (sortedTasks[newPosition].position * 2 + 10) / 2;
  } else if (
    !sortedTasks[newPosition - 1] ||
    !sortedTasks[newPosition - 1].position
  ) {
    // Missing Above
    updatedPosition = sortedTasks[newPosition].position / 2;
  } else {
    // Both Above and Below
    if (task.position > sortedTasks[newPosition].position) {
      updatedPosition =
        (sortedTasks[newPosition].position +
          sortedTasks[newPosition - 1].position) /
        2;
    } else {
      updatedPosition =
        (sortedTasks[newPosition + 1].position +
          sortedTasks[newPosition].position) /
        2;
    }
  }

  // Ensure updated position is within valid bounds
  updatedPosition = Math.max(updatedPosition, sortedTasks[0].position + 0.1);
  updatedPosition = Math.min(
    updatedPosition,
    sortedTasks[sortedTasks.length - 1].position - 0.1
  );

  await prisma.task.update({
    where: { id: task.id },
    data: {
      position: updatedPosition,
      categoryId: destinationColumnId,
    },
  });

  if (newPosition === 10000) {
    const normalizedTasks = sortedTasks.map((task, index) => {
      return {
        ...task,
        position: 10 * (index + 1),
      };
    });
  }

  return NextResponse.json(
    { message: "Task updated successfully" },
    { status: 200 }
  );
}
