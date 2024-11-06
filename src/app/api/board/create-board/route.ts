import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Validate Request
  const formData = await request.formData();
  const name = formData.get("project_name") as string;
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const session: any = await getServerSession(authOptions);
    console.log('session on server= ', session?.user, formData)
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const user_id = session.user.id

    const project = await prisma.project.create({
        data:{
            userId: user_id,
            name: name
        }
    });

    return NextResponse.json(
      { message: "Board created successfully" },
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
