import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = await getUserData(session);

    if (!user) {
      return NextResponse.json(
        { message: "User not found. Please try again" },
        { status: 404 }
      );
    }

    const labels = await prisma.label.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ labels });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
