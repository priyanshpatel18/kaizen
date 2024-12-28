import { getUserData } from "@/actions/getUserData";
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

  const session = await getServerSession(authOptions);

  try {
    const user = await getUserData(session);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const task = await prisma.task.findUnique({
      where: {
        id,
      },
    });
    if (!task) {
      return NextResponse.json({ message: "Task doesn't exist" }, { status: 404 });
    }

    const newTask = await prisma.task.update({
      where: {
        id,
      },
      data: updates,
    });

    return NextResponse.json({ message: "Task updated", task: newTask });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
