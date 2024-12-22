// Route to set subscription

import { getUserData } from "@/actions/getUserData";
import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { PushSubscription } from "web-push";

export async function POST(request: NextRequest) {
  const body: { subscription: PushSubscription } = await request.json();

  const session = await getServerSession(authOptions);

  try {
    const user = await getUserData(session);
    if (!user) {
      return NextResponse.json({ message: "Please sign in first" }, { status: 404 });
    }

    let subscription = await prisma.pushSubscription.findFirst({
      where: { userId: user.id },
    });

    if (subscription) {
      const isEqual =
        subscription.endpoint === body.subscription.endpoint &&
        subscription.p256dh === body.subscription.keys.p256dh &&
        subscription.auth === body.subscription.keys.auth &&
        subscription.expirationTime === body.subscription.expirationTime;

      if (isEqual) {
        return NextResponse.json({ message: "Subscription data is already up to date" }, { status: 200 });
      }

      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: {
          endpoint: body.subscription.endpoint,
          p256dh: body.subscription.keys.p256dh,
          auth: body.subscription.keys.auth,
          expirationTime: body.subscription.expirationTime,
        },
      });

      return NextResponse.json({ message: "Allowed Push Notifications" }, { status: 200 });
    }

    subscription = await prisma.pushSubscription.create({
      data: {
        endpoint: body.subscription.endpoint,
        p256dh: body.subscription.keys.p256dh,
        auth: body.subscription.keys.auth,
        expirationTime: body.subscription.expirationTime,
        userId: user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json({ message: "Something went wrong, please try again" }, { status: 500 });
    }

    return NextResponse.json({ message: "Allowed Push Notifications" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Something went wrong, please try again",
        error: error,
      },
      { status: 500 }
    );
  }
}
