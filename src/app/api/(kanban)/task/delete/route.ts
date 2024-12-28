import prisma from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id || typeof id !== "string") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const task = await prisma.task.delete({
      where: {
        id,
      },
    });
    if (!task) {
      return NextResponse.json({ message: "Task doesn't exist" }, { status: 404 });
    }

    return NextResponse.json({ task, message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
