import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { projectSchema } from "@/zod/project";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const { id, updateValue } = await request.json();
  if (!id || !updateValue) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  const updates = await projectSchema.parseAsync(updateValue);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: updates,
    });
    if (!project) {
      return NextResponse.json({ message: "Project doesn't exist" }, { status: 404 });
    }

    let message = "Project updated successfully";
    if (updates.isFavorite) {
      message = "Added to favorites";
    }

    return NextResponse.json({ project, message }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
