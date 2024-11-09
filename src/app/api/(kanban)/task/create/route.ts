import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const name = formData.get("title") as string;
  // const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!name || !categoryId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  try {
    const user = await getUserData(session);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId.trim() },
    });

    if (!category) {
      return NextResponse.json(
        { message: "No Category! Create a category and try again" },
        { status: 404 }
      );
    }

    const tasks = await prisma.task.count({
      where: {
        categoryId: category.id,
      },
    });

    const task = await prisma.task.create({
      data: {
        title: name,
        // description,
        categoryId: category.id,
        position: tasks ? (tasks + 1) * 1000 : 1000,
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not created" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Task created successfully", task });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
