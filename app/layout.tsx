// src/app/layout.tsx
import "./globals.css";
import Layout from "./components/layout";

export const metadata = {
  title: "Neuron",
  description: "Task management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-neutral-900 text-neutral-100">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}