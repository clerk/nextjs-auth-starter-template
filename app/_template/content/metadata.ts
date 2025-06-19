import { Metadata } from "next";

export const templateMetadata: Metadata = {
  metadataBase: new URL("https://clerk-nextjs-app-router.vercel.app/"),
  title: "Next.js Clerk Template",
  description:
    "A simple and powerful Next.js template featuring authentication and user management powered by Clerk.",
  openGraph: { images: ["/og.png"] },
};

// Default metadata for when template is removed
export const defaultMetadata: Metadata = {
  title: "My App",
  description: "My Next.js app with Clerk authentication",
};
