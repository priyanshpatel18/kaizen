import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Validate Request
  const formData = await request.formData();
  const name = formData.get("category_name") as string;
  const project_id = formData.get("project_id") as string;
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const session: any = await getServerSession(authOptions);
    console.log('session on server= ', session?.user, formData)
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const previous_category_count = await prisma.category.count({
      where:{
        projectId: project_id,
      }
    })

    console.log('total categorie =-', previous_category_count)

    const category = await prisma.category.create({
        data:{
            projectId: project_id,
            title: name.toLowerCase(),
            position: previous_category_count === 0 ? 0 : previous_category_count
        }
    });

    return NextResponse.json(
      { message: "Category created successfully" },
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
