import type { MetadataRoute } from "next";

const { appName, description } = {
  appName: "Kaizen",
  description:
    "Kaizen is an intuitive productivity tool that helps you streamline tasks, prioritize goals, and boost efficiency. With a clean, user-friendly interface and powerful features, Kaizen supports both individuals and teams in managing their daily, weekly, and long-term objectives. Experience seamless task management designed to simplify productivity.",
};

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: appName,
    description: description,
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
