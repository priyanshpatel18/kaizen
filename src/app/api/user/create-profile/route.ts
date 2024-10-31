import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/helper";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Validate Request
  const formData = await request.formData();
  const profile = formData.get("profile") as File;
  const name = formData.get("name") as string;
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let secure_url;
    let public_id;

    if (profile) {
      if (user.profile && user.publicId) {
        await deleteFromCloudinary(user.publicId);
      }

      const fileBuffer = await profile.arrayBuffer();

      const mimeType = profile.type;
      const encoding = "base64";
      const base64Data = Buffer.from(fileBuffer).toString("base64");

      const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

      const response = await uploadToCloudinary(fileUri, profile.name);
      if (!response) {
        return NextResponse.json(
          { message: "Failed to upload profile" },
          { status: 500 }
        );
      }

      secure_url = response.secure_url;
      public_id = response.public_id;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        profile: secure_url,
        publicId: public_id,
      },
    });

    return NextResponse.json(
      { message: "Profile Created successfully" },
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
