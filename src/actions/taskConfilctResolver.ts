import prisma from "@/db";

export default async function taskConfilctResolver(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId
      },
      include: {
        tasks: {
          orderBy: {
            updatedAt: "desc"
          }
        }
      }
    });
    if (!category) {
      return;
    }

    const sortedTasksByUpdatedAt = category.tasks;
    if (sortedTasksByUpdatedAt.length < 2) {
      return;
    }

    let conflicts = false;

    category.tasks.forEach((task) => {
      const remainingTasks = sortedTasksByUpdatedAt.filter((t) => t.id !== task.id);
      remainingTasks.forEach((remainingTask) => {
        if (task.position === remainingTask.position) {
          conflicts = true;
          return;
        }
      });
    });

    if (conflicts) {
      const updatedTasks = sortedTasksByUpdatedAt.map((task, index) =>
        prisma.task.update({
          where: {
            id: task.id
          },
          data: {
            position: (index + 1) * 1000
          }
        })
      );

      await Promise.all(updatedTasks);
    }
  } catch (error) {
    console.error("Error resolving task conflicts:", error);
  }
}