import { auth, clerkClient } from "@clerk/nextjs/server";
import { OrgDetails, SessionDetails, UserDetails } from "./details";

export default async function DashboardPage() {
  const { userId } = auth().protect();

  const user = await clerkClient.users.getUser(userId);

  return (
    <div className="px-8 py-12 sm:py-16 md:px-20">
      {user && (
        <>
          <h1 className="text-3xl font-semibold text-black">
            👋 Hi, {user.firstName || `Stranger`}
          </h1>
          <div className="grid gap-4 mt-8 lg:grid-cols-3">
            <UserDetails />
            <SessionDetails />
            <OrgDetails />
          </div>
          <article
            className="px-8 py-12 mt-8 bg-black bg-opacity-5 md:px-20 md:py-24"
            id="features"
          >
            <h2 className="text-3xl font-semibold">What's next?</h2>

            <div className="grid gap-8 mt-8 lg:grid-cols-3">
              <div className="flex flex-col h-56 gap-1 p-8 bg-white shadow-lg rounded-2xl">
                <h3 className="text-lg font-medium">
                  Use your JWT to authenticate requests
                </h3>
                <p className="text-gray-700">
                  Prebuilt components to handle essential functionality like
                  user sign-in, sign-up, and account management.
                </p>
                <div className="grow"></div>
                <a
                  href="https://clerk.com/docs/component-reference/overview?utm_source=vercel-template&utm_medium=template_repos&utm_campaign=nextjs_template"
                  className="text-primary-600 cta hover:underline"
                  target="_blank"
                >
                  Components <span className="arrow">-&gt;</span>
                </a>
              </div>
              <div className="flex flex-col h-56 gap-1 p-8 bg-white shadow-lg rounded-2xl">
                <h3 className="text-lg font-medium">
                  Enter your user's into an onboarding flow
                </h3>
                <p className="text-gray-700">
                  Build custom functionality by accessing auth state, user and
                  session data, and more with Clerk's React Hooks.
                </p>
                <div className="grow"></div>
                <a
                  href="https://clerk.com/docs/reference/clerk-react/useuser?utm_source=vercel-template&utm_medium=template_repos&utm_campaign=nextjs_template"
                  className="text-primary-600 cta hover:underline"
                  target="_blank"
                >
                  React Hooks <span className="arrow">-&gt;</span>
                </a>
              </div>
              <div className="flex flex-col h-56 gap-1 p-8 bg-white shadow-lg rounded-2xl">
                <h3 className="text-lg font-medium">
                  Deploy your application to production
                </h3>
                <p className="text-gray-700">
                  Seamlessly create and switch between organizations, invite and
                  manage members, and assign custom roles.
                </p>
                <div className="grow"></div>
                <a
                  href="https://clerk.com/docs/organizations/overview?utm_source=vercel-template&utm_medium=template_repos&utm_campaign=nextjs_template"
                  className="text-primary-600 cta hover:underline"
                  target="_blank"
                >
                  Organizations <span className="arrow">-&gt;</span>
                </a>
              </div>
            </div>
          </article>
        </>
      )}
    </div>
  );
}
