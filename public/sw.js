// sw = service worker

self.addEventListener("install", (event) => {
  // Place to perform any setup tasks
  event.waitUntil(self.skipWaiting()); // Activate immediately
});

function sendDeliveryReportAction() {
  // Place to send delivery report
  console.log("Web push delivered.");
}

self.addEventListener("push", function (event) {
  if (!event.data) {
    console.warn("Push event but no data");
    return;
  }

  // Sent by the server
  const payload = event.data.json();
  const { body, icon, image, badge, url, title } = payload;

  // Create a notification options using the payload
  const notificationTitle = title || "Notification";
  const notificationOptions = {
    body,
    icon,
    image,
    badge,
    data: { url },
    // Add more options as needed
    actions: [
      {
        action: "open_url",
        title: "View in browser",
      },
    ],
  };

  // Display the notification
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions).then(() => {
      sendDeliveryReportAction();
    })
  );
});

// Event listener for notification click to open the URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // Close the notification on click

  const { url } = event.notification.data;

  // Perform different actions based on notification data
  event.waitUntil(
    (async () => {
      if (event.action === "open_url" && url) {
        // Open the URL in a new tab
        await clients.openWindow(url);
      } else if (url) {
        // Default action if clicked outside the button
        await clients.openWindow(url);
      } else {
        console.warn("No URL to open on notification click");
      }
    })()
  );
});

// Event listener for notification close
self.addEventListener("notificationclose", (event) => {
  console.info("Notification closed");
});
