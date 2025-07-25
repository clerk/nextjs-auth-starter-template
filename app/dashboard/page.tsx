import { UserDetails } from "../components/user-details";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CodeSwitcher } from "../components/code-switcher";
import { LearnMore } from "../_template/components/learn-more";
import { Footer } from "../_template/components/footer";
import { ClerkLogo } from "../_template/components/clerk-logo";
import { NextLogo } from "../_template/components/next-logo";
import Link from "next/link";

import { DASHBOARD_CARDS } from "../_template/content/cards";
import { DeployButton } from "../_template/components/deploy-button";

export default async function DashboardPage() {
  await auth.protect();

  return (
    <>
      <main className="max-w-300 w-full mx-auto">
        <div className="grid grid-cols-[1fr_20.5rem] gap-10 pb-10">
          <div>
            <header className="flex items-center justify-between w-full h-16 gap-4">
              <div className="flex gap-4">
                <div className="bg-[#F4F4F5] px-4 py-3 rounded-full inline-flex gap-4">
                  <ClerkLogo />
                  <div aria-hidden className="w-px h-6 bg-[#C7C7C8]" />
                  <NextLogo />
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-2 font-medium text-[0.8125rem] rounded-full px-3 py-2 hover:bg-gray-100"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Home
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-8",
                    },
                  }}
                />
              </div>
            </header>
            <UserDetails />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center h-16 w-full">
              <DeployButton className="h-8" />
            </div>
            <CodeSwitcher />
          </div>
        </div>
      </main>
      <LearnMore cards={DASHBOARD_CARDS} />
      <Footer />
    </>
  );
}
