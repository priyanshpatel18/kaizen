import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = await z.object({ name: z.string().min(1) }).parseAsync(body);
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    const user = await getUserData(session);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const label = await prisma.label.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return NextResponse.json({ label });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
