import { Metadata } from "next";

const { title, description, ogImage, baseURL } = {
  title: "Kaizen - Elevate Your Productivity with Task Management",
  description:
    "Kaizen is an intuitive productivity tool that helps you streamline tasks, prioritize goals, and boost efficiency. With a clean, user-friendly interface and powerful features, Kaizen supports both individuals and teams in managing their daily, weekly, and long-term objectives. Experience seamless task management designed to simplify productivity.",
  baseURL: "https://kaizen.priyanshpatel.site",
  ogImage: `https://kaizen.priyanshpatel.site/open-graph.png`,
};

export const siteConfig: Metadata = {
  title,
  description,
  metadataBase: new URL(baseURL),
  openGraph: {
    title,
    description,
    images: [ogImage],
    url: baseURL,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  icons: {
    icon: "/favicon.ico",
  },
  applicationName: "Kaizen",
  alternates: {
    canonical: baseURL,
  },
  keywords: [],
};
