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
    const { projectId, categories } = await request.json();

    console.log('data =', projectId, categories)
    if (!projectId || !Array.isArray(categories)) {
      return NextResponse.json({ message: "Invalid data provided" }, { status: 400 });
    }

    // Start a transaction to update category positions
    await prisma.$transaction(
      categories.map((category, index) =>
        prisma.category.update({
          where: {
            id: category.id,
          },
          data: {
            position: index, // Assign position based on the order in the categories array
          },
        })
      )
    );

    return NextResponse.json(
      { message: "Category positions updated successfully" },
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
