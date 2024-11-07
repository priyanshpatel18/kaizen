import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

const SERVICE_WORKER_FILE_PATH = "/sw.js";

// Check if notification is supported
export function checkNotificationSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "showNotification" in ServiceWorkerRegistration.prototype
  );
}

// Check for permission and trigger registration
export function checkForPermissionAndTrigger() {
  const state = Notification.permission;

  switch (state) {
    case "denied":
      // console.log('Notification permission denied.');
      break;

    case "granted":
      // console.log('Notification permission granted.');
      registerAndSubscribe();
      break;

    case "default":
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          // console.log('Notification permission granted.');
          registerAndSubscribe();
        } else {
          // console.log('Notification permission denied.');
        }
      });
      break;
  }
}

// Register and subscribe
export async function registerAndSubscribe() {
  try {
    // Register service-worker
    await navigator.serviceWorker.register(SERVICE_WORKER_FILE_PATH);

    // Make the worker Subscribe to push
    await subscribe();
  } catch (error) {
    console.error("Failed to register service-worker: ", error);
  }
}

async function subscribe() {
  // If service worker is registered
  navigator.serviceWorker.ready
    // Subscribe to push
    .then((registration: ServiceWorkerRegistration) => {
      // Call the pushManager to subscribe to push notifications
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
    })
    // If subscription is successful -> handle subscription
    .then((subscription: PushSubscription) => {
      // Send the subscription object to the server for storage
      submitSubscription(subscription);
    })
    .catch((e) => {
      console.error("Failed to subscribe cause of: ", e);
    });
}

// Backend Requests
async function submitSubscription(subscription: PushSubscription) {
  const endpointUrl = "/api/web-push/subscription";
  const res = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription }),
  });
  const result = await res.json();
  if (!res.ok) {
    return Promise.reject(result);
  }
}
