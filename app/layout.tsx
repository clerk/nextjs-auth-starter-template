import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { PrismScripts } from "@/components/prism-scripts";

export const metadata: Metadata = {
  metadataBase: new URL("https://clerk-next-app.vercel.app/"),
  title: "Next.js Clerk Template",
  description:
    "A simple and powerful Next.js template featuring authentication and user management powered by Clerk.",
  openGraph: { images: ["/og.png"] },
};

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`min-h-screen flex flex-col antialiased`}>
        <ThemeProvider>
          <ClerkProvider
            appearance={{
              variables: { colorPrimary: "#000000" },
              elements: {
                formButtonPrimary:
                  "bg-black border border-black border-solid hover:bg-white hover:text-black",
                socialButtonsBlockButton:
                  "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
                socialButtonsBlockButtonText: "font-semibold",
                formButtonReset:
                  "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
                membersPageInviteButton:
                  "bg-black border border-black border-solid hover:bg-white hover:text-black",
                card: "bg-[#fafafa]",
              },
            }}
          >
            {children}
            <Toaster />
            <PrismScripts />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
