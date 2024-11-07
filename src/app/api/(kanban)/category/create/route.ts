import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.formData();

  const title = body.get("title") as string;
  const projectId = body.get("projectId") as string;

  if (!title || !projectId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  try {
    const user = await getUserData(session);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const projectCategories = await prisma.category.count({
      where: {
        projectId,
      },
    });

    const category = await prisma.category.create({
      data: {
        title,
        projectId,
        position: projectCategories ? (projectCategories + 1) * 10 : 10,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
