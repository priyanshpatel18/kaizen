import prisma from "@/db";
import { Session } from "next-auth";

export async function getUserData(session: Session | null) {
  if (!session?.user) {
    return null;
  }
  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
    include: { userWorkspace: true },
  });

  if (!user) {
    return null;
  }

  return user;
}
