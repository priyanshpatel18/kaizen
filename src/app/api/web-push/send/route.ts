// Route to send push notification

import prisma from "@/db";
import { webPush } from "@/lib/webPush";
import { NextRequest, NextResponse } from "next/server";
import { PushSubscription } from "web-push";

// BODY
// payload
// users : ["userId"]

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = JSON.stringify(body.payload);
  const users: string[] = await body.users;

  try {
    const subs = await prisma.pushSubscription.findMany({
      where: {
        userId: {
          in: users,
        },
      },
    });
    if (subs.length === 0) {
      return NextResponse.json({ message: "Users haven't enabled push notifications" }, { status: 404 });
    }

    for (const sub of subs) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
        expirationTime: sub.expirationTime,
      } as PushSubscription;

      await webPush.sendNotification(subscription, payload);
    }

    return NextResponse.json({
      message: `Notification${users.length > 1 && "s"} sent successfully`,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Notifications could not be sent" }, { status: 500 });
  }
}
