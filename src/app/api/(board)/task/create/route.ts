import taskConfilctResolver from "@/actions/taskConfilctResolver";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const name = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const dueDateInput = formData.get("dueDate");

  if (!name || !categoryId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        tasks: true,
      },
    });

    if (!category) {
      return NextResponse.json({ message: "No Category! Create a category and try again" }, { status: 404 });
    }

    const dueDate = dueDateInput ? new Date(dueDateInput.toString()) : new Date().setHours(23, 59, 59, 999);

    const task = await prisma.task.create({
      data: {
        title: name,
        description,
        dueDate: new Date(dueDate),
        categoryId: category.id,
        position: category.tasks.length > 0 ? (category.tasks.length + 1) * 1000 : 1000,
        priority: 4,
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not created" }, { status: 500 });
    }

    taskConfilctResolver(category.id);

    return NextResponse.json({ message: "Task created successfully", task });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
