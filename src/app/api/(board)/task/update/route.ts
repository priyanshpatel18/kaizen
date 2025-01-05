import taskConfilctResolver from "@/actions/taskConfilctResolver";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { taskSchema } from "@/zod/task";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const { id, updateValue } = await request.json();
  if (!id || !updateValue) {
    return NextResponse.json({ message: "Invalid Request" });
  }
  const updates = await taskSchema.parseAsync(updateValue);

  if (!updates) {
    return NextResponse.json({ message: "Invalid Request" });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: updates,
    });
    if (!task) {
      return NextResponse.json({ message: "Task doesn't exist" }, { status: 404 });
    }

    if (updates.position) {
      taskConfilctResolver(task.categoryId);
    }

    return NextResponse.json({ message: "Task updated", task: task });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
