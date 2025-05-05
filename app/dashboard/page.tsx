import { UserDetails } from "../components/user-details";
import {  UserButton } from "@clerk/nextjs";
import { Footer } from "../components/footer";
import { ClerkLogo } from "../components/clerk-logo";
import { NextLogo } from "../components/next-logo";


export default async function DashboardPage() {
  return (
    <>
      <main className="max-w-[75rem] w-full mx-auto">
        <div className="grid grid-cols-[1fr_20.5rem] gap-10 pb-10">
          <div>
            <header className="flex items-center justify-between w-full h-16 gap-4">
              <div className="flex gap-4">
                <ClerkLogo />
                <div aria-hidden className="w-px h-6 bg-[#C7C7C8]" />
                <NextLogo />
              </div>
              <div className="flex items-center gap-2">
               
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-6",
                    },
                  }}
                />
              </div>
            </header>
            <UserDetails />
          </div>
          {/* <div className="pt-[3.5rem]">
            <CodeSwitcher />
          </div> */}
        </div>
      </main>
      {/* <LearnMore cards={DASHBOARD_CARDS} /> */}
      <Footer />
    </>
  );
}
