import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { User } from "@/types/common";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as User;

  if (!sessionUser) {
    return NextResponse.json(
      { message: "Please sign in first" },
      { status: 404 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email, id: sessionUser.id },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found. Please try again" },
        { status: 404 }
      );
    }

    const userData = {
      email: user.email,
      id: user.id,
      token: user.token,
      name: user.name,
      profilePicture: user.profilePicture,
    };
    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. Please try again" },
      { status: 500 }
    );
  }
}
