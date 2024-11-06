import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Validate Request
  const formData = await request.formData();
  const name = formData.get("task_name") as string;
  const description = formData.get("task_description") as string;
  const category_id = formData.get("category_id") as string;
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const session: any = await getServerSession(authOptions);
    console.log('session on server= ', session?.user, formData)
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }
    console.log('server call =', name, description, category_id)
    
    const previous_task_count = await prisma.task.count({
      where: {
        categoryId: category_id
      }
    })

    const category = await prisma.task.create({
        data:{
            categoryId: category_id,
            name: name,
            description: description,
            priority: "",
            isCompleted: false,
            position: previous_task_count + 1
        }
    });

    return NextResponse.json(
      { message: "Task created successfully" },
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
