import { getUserData } from "@/actions/getUserData";
import taskConfilctResolver from "@/actions/taskConfilctResolver";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { Task } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function getUpdatedPosition(tasks: Task[], newPosition: number, src: string, dest: string, task: Task) {
  const targetTask = tasks[newPosition];
  const aboveTargetTask = tasks[newPosition - 1];
  const belowTargetTask = tasks[newPosition + 1];

  if (targetTask === undefined) {
    // MOVED TASK TO EMPTY COLUMN
    // MOVED TASK TO BOTTOM FROM DIFFERENT COLUMN
    return (tasks.length + 1) * 1000;
  } else if (newPosition === 0 && targetTask !== undefined) {
    // MOVED TASK TO TOP FROM SAME COLUMN
    // MOVED TASK TO TOP FROM DIFFERENT COLUMN
    return targetTask.position / 2;
  } else if (src !== dest) {
    // MOVED TASK TO DIFFERENT COLUMN
    // PERFORMING THIS TO RESTRICT GOING BELOW FOR 1 EDGE CASE - WHEN MOVING TASK TO SECOND LAST POSITION
    return (targetTask.position + aboveTargetTask.position) / 2;
  } else if (newPosition === tasks.length - 1) {
    // MOVED TASK TO BOTTOM FROM SAME COLUMN
    return (targetTask.position * 2 + 1000) / 2;
  } else if (src === dest) {
    if (task.position < targetTask.position) {
      return (targetTask.position + belowTargetTask.position) / 2;
    } else {
      return (targetTask.position + aboveTargetTask.position) / 2;
    }
  }
  return null;
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { sourceCategoryId, destinationCategoryId, taskId, newPosition } = body;

  if (!sourceCategoryId || !destinationCategoryId || typeof newPosition !== "number") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  try {
    const user = await getUserData(session);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const [sourceColumn, destinationColumn] = await prisma.$transaction([
      prisma.category.findUnique({ where: { id: sourceCategoryId }, include: { tasks: true } }),
      prisma.category.findUnique({ where: { id: destinationCategoryId }, include: { tasks: true } }),
    ]);

    if (!sourceColumn || !destinationColumn) {
      return NextResponse.json({ message: "Source or destination column not found" }, { status: 404 });
    }

    const task = sourceColumn.tasks.find((task) => task.id === taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const sortedDestinationTasks = [...destinationColumn.tasks].sort((a, b) => a.position - b.position);

    const updatedPosition = getUpdatedPosition(
      sortedDestinationTasks,
      newPosition,
      sourceCategoryId,
      destinationCategoryId,
      task
    );
    if (!updatedPosition) {
      return NextResponse.json({ message: "Something went wrong, please try again" }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        position: updatedPosition,
        categoryId: destinationCategoryId,
      },
    });
    if (!updatedTask) {
      return NextResponse.json({ message: "Something went wrong, please try again" }, { status: 500 });
    }
    taskConfilctResolver(destinationCategoryId);

    return NextResponse.json({ message: "Position updated successfully", task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error("Error in PUT request:", error);
    return NextResponse.json({ message: "Error updating task position" }, { status: 500 });
  }
}

// UPDATED POSITION LOGIC

// let updatedPosition: number;

// if (sortedDestinationTasks[newPosition] === undefined) {
//   // MOVED TASK TO EMPTY COLUMN
//   updatedPosition = (sortedDestinationTasks.length + 1) * 1000;
// }
// else if (
//   newPosition === 0 &&
//   sortedDestinationTasks[newPosition] !== undefined
// ) {
//   updatedPosition = sortedDestinationTasks[newPosition].position / 2;
// }
// else if (sourceCategoryId !== destinationCategoryId) {
//   updatedPosition = (sortedDestinationTasks[newPosition].position + sortedDestinationTasks[newPosition - 1].position) / 2;
// }
// else if (newPosition === sortedDestinationTasks.length - 1) {
//   updatedPosition =
//     (sortedDestinationTasks[newPosition].position * 2 + 1000) / 2;
// }
// else if (sourceCategoryId === destinationCategoryId) {
//   if (task.position < sortedDestinationTasks[newPosition].position) {
//     updatedPosition = (sortedDestinationTasks[newPosition].position + sortedDestinationTasks[newPosition + 1].position) / 2;
//   } else {
//     updatedPosition = (sortedDestinationTasks[newPosition - 1].position + sortedDestinationTasks[newPosition].position) / 2;
//   }
// }

// TRANSACTION

// const transaction = await prisma.$transaction(async (prisma) => {
//   const conflicts = sortedDestinationTasks.filter(
//     (t) => t.position === updatedPosition
//   );

//   if (conflicts.length > 0 || destinationColumn.reorderCount + 1 > 20) {
//     const reorderCount = await prisma.category.update({
//       where: { id: destinationCategoryId },
//       data: { reorderCount: 0 },
//     });

//     let newSortedDestinationTasks = sortedDestinationTasks.map((task) => {
//       if (task.id === taskId) task.position = updatedPosition;
//       return task;
//     });

//     if (conflicts.length === 0) {
//       newSortedDestinationTasks = newSortedDestinationTasks.sort(
//         (a, b) => a.position - b.position
//       );
//     }

//     const taskUpdates = newSortedDestinationTasks.map((task, index) =>
//       prisma.task.update({
//         where: { id: task.id },
//         data: {
//           position: (index + 1) * 1000,
//           categoryId: destinationCategoryId,
//         },
//       })
//     );

//     await Promise.all(taskUpdates);

//     if (!reorderCount || !taskUpdates) {
//       return null;
//     }

//     if (conflicts.length > 0) {
//       throw new Error("Task position conflict");
//     }

//     return reorderCount;
//   }

//   const taskUpdate = await prisma.task.update({
//     where: { id: task.id },
//     data: {
//       position: updatedPosition,
//       categoryId: destinationCategoryId,
//     },
//   });

//   const reorderCount = await prisma.category.update({
//     where: { id: destinationCategoryId },
//     data: {
//       reorderCount: { increment: 1 },
//     },
//   });

//   if (!taskUpdate || !reorderCount) return null;

//   return reorderCount;
// });

// if (!transaction) {
//   return NextResponse.json(
//     { message: "Something went wrong, please try again" },
//     { status: 500 }
//   );
// }
