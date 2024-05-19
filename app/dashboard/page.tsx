import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserDetails } from "../components/user-details";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { CodeSwitcher } from "../components/code-switcher";
import { LearnMore } from "../components/learn-more";
import { Footer } from "../components/footer";

import { DASHBOARD_CARDS } from "../consts/cards";

export default async function DashboardPage() {
  const { userId } = auth().protect();

  const user = await clerkClient.users.getUser(userId);

  if (!user) return null;

  function Oval() {
    return (
      <div className="flex justify-center items-center h-5 w-7 rounded-full border-2 border-black bg-orange-500 mx-4"></div>
    );
  }

  return (
    <>
      <main className="max-w-[75rem] w-full mx-auto"> 
            <header className="flex gap-4 h-16 justify-between items-center w-full">
            <div className="flex items-center gap-1 mb-1">
              <Oval />
              <Oval />
              <Oval />
              <Oval />
              <Oval />
              <Oval />
            <div className="flex items-center justify-center w-full">
              <span className="text-2xl font-bold text-orange-500 border-2 border-black px-4 py-1 rounded-full">
                Framing Zone
              </span>
            </div>
              <Oval />
              <Oval />
              <Oval />
              <Oval />
              <Oval />
              <Oval />
    
            </div>
            
              <div className="flex gap-4">
                <div aria-hidden className="w-px h-6 bg-[#C7C7C8]" />
              </div>
              <div className="flex items-center gap-2">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-6",
                    },
                  }}
                />
                
              </div>
            </header>

          
          
       
      </main>
      <LearnMore cards={DASHBOARD_CARDS} />
      <Footer />
    </>
  );
}
