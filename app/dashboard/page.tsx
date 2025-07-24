import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth.protect();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const credits = user.publicMetadata.credits as number || 0;
  const firstName = user.firstName || "User";

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-[#6B46C1] dark:text-[#7D5A9E]">
          ApologyOwed.ai Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {/* Dark mode toggle - implement with a button or use a library like next-themes */}
          <button
            aria-label="Toggle dark mode"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
          >
            {/* Icon for toggle - add SVG or use heroicons */}
            🌙
          </button>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-8",
              },
            }}
          />
        </div>
      </header>

      <section className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Welcome back, {firstName}!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create personalized apologies with AI.
          </p>
        </div>

        {/* Credits bar */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8 flex justify-between items-center">
          <div>
            <span className="font-medium">Available Credits:</span> {credits}
          </div>
          <Link
            href="/buy-credits" // Replace with your payments route
            className="bg-[#6B46C1] text-white px-4 py-2 rounded-md hover:bg-[#7D5A9E] focus:outline-none focus:ring-2 focus:ring-[#6B46C1] transition-colors"
          >
            Buy More
          </Link>
        </div>

        {/* Create button */}
        <div className="text-center">
          <Link
            href="/create"
            className="bg-[#6B46C1] text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-[#7D5A9E] focus:outline-none focus:ring-2 focus:ring-[#6B46C1] transition-colors"
          >
            Create New Apology
          </Link>
        </div>
      </section>

      {/* Footer or additional sections if needed */}
      <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        © 2025 ApologyOwed.ai | Privacy-focused AI apologies
      </footer>
    </main>
  );
}