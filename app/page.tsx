import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { LearnMore } from "./components/learn-more";
import screenshotDevices from "./images/user-button@2xrl.webp";
import signIn from "./images/sign-in@2xrl.webp";
import verify from "./images/verify@2xrl.webp";
import userButton2 from "./images/user-button-2@2xrl.webp";
import signUp from "./images/sign-up@2xrl.webp";
import logo from "./images/logo.png";
import "./home.css";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "./components/footer";

import { CARDS } from "./consts/cards";
import { ClerkLogo } from "./components/clerk-logo";
import { NextLogo } from "./components/next-logo";

export default function Home() {
  return (
    <>
      <main className="bg-[#FAFAFA] relative">
        <div className="w-full bg-white max-w-[75rem] mx-auto flex flex-col border-l border-r border-[#F2F2F2] row-span-3">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-[#F2F2F2]" />
          <Image
            alt="Device"
            className="size-64 bg-transparent absolute left-1/2 -translate-x-[23.75rem] -top-6 h-[51.375rem] object-contain w-[39.0625rem]"
            src={logo}
            unoptimized
          />

          <div className="px-12 py-16 border-b border-[#F2F2F4]">
            <div className="bg-[#F4F4F5] px-4 py-3 rounded-full inline-flex gap-4">
              <ClerkLogo />
              <div aria-hidden className="w-px h-6 bg-[#C7C7C8]" />
              <NextLogo />
            </div>
          </div>

          <div className="p-10 border-b border-[#F2F2F2]">
            <h1 className="text-5xl font-bold tracking-tight text-[#131316] relative">
              Auth starts here
            </h1>

            <p className="text-[#5E5F6E] pt-3 pb-6 max-w-[30rem] text-[1.0625rem] relative">
              A simple and powerful Next.js template featuring authentication
              and user management powered by Clerk.
            </p>
            <div className="relative flex gap-3">
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-[#131316] text-white text-sm font-semibold"
                >
                  Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <button className="px-4 py-2 rounded-full bg-[#131316] text-white text-sm font-semibold">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <Link
                href="/#features"
                className="px-4 py-2 rounded-full text-[#131316] text-sm font-semibold bg-[#F7F7F8]"
              >
                Learn more
              </Link>
            </div>
          </div>
          <div className="flex gap-8 w-full h-[41.25rem] scale-[1.03]">
            <div className="space-y-8 translate-y-12">
              <Image
                alt="Device"
                src={signUp}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
            </div>
            <div className="space-y-8 -translate-y-4">
              <Image
                alt="Device"
                src={verify}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
              <Image
                alt="Device"
                src={userButton2}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
            </div>
            <div className="space-y-8 -translate-y-[22.5rem]">
              <Image
                alt="Device"
                src={signIn}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
              <Image
                alt="Device"
                src={screenshotDevices}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
            </div>
          </div>
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-[18.75rem] bg-gradient-to-t from-white" />
      </main>
      <LearnMore cards={CARDS} />
      <Footer />
    </>
  );
}
