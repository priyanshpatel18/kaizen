import webPush from "web-push";

webPush.setVapidDetails(
  process.env.NEXT_PUBLIC_VAPID_SUBJECT || "",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || ""
);

export { webPush };
