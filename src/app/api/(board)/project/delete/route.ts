import prisma from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const project = await prisma.project.delete({
      where: {
        id,
      },
    });
    if (!project) {
      return NextResponse.json({ message: "Project doesn't exist" }, { status: 404 });
    }

    return NextResponse.json({ project, message: "Project deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
