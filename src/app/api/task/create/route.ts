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

    const tasks = await prisma.task.count({
      where: {
        categoryId,
      },
    });

    const task = await prisma.task.create({
      data: {
        title: name,
        // description,
        categoryId,
        position: tasks ? (tasks + 1) * 10 : 10,
      },
    });

    return NextResponse.json({ message: "Task created successfully", task });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}