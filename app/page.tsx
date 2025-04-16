import { SignIn, SignedIn, SignedOut } from "@clerk/nextjs"
import logo from "./images/logo.png"
import "./home.css"
import Image from "next/image"
import { redirect } from "next/navigation"
import { ClerkLogo } from "./components/clerk-logo"
import { NextLogo } from "./components/next-logo"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 pt-8 pb-4 flex flex-col items-center">
          <div className="bg-[#F4F4F5] px-4 py-3 rounded-full inline-flex gap-4 mb-6">
            <ClerkLogo />
            <div aria-hidden className="w-px h-6 bg-[#C7C7C8]" />
            <NextLogo />
          </div>

          <Image
            alt="Logo"
            className="h-16 w-auto mb-4"
            src={logo}
            unoptimized
          />

          <h1 className="text-2xl font-bold tracking-tight text-[#131316] mb-2 text-center">
            Welcome to NextIS Chauffeur
          </h1>

          <p className="text-[#5E5F6E] text-sm mb-6 text-center">
            Sign in to access your premium chauffeur management platform
          </p>

          <SignedIn>
            {/* If the user is signed in, redirect them to the dashboard */}
            {redirect("/dashboard")}
          </SignedIn>

          <SignedOut>
            <div className="w-full">
              <SignIn redirectUrl="/dashboard" />
            </div>
          </SignedOut>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} NextIS Chauffeur. All rights reserved.</p>
      </footer>
    </div>
  )
}
