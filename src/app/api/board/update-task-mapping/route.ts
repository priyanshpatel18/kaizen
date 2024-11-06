import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const userId = session.user.id;
    const { projectId, tasks } = await request.json();

    console.log('data =', projectId, tasks)
    if (!projectId || !Array.isArray(tasks)) {
      return NextResponse.json({ message: "Invalid data provided" }, { status: 400 });
    }

    // Start a transaction to update category positions
    await prisma.$transaction(
      tasks.map((task, index) =>
        prisma.task.update({
          where: {
            id: task.id,
          },
          data: {
            position: index,
          },
        })
      )
    );

    return NextResponse.json(
      { message: "Task positions updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
