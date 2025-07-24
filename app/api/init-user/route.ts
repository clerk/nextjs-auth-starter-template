import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if metadata is already set (optional, to avoid overwriting)
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.publicMetadata.credits !== undefined) {
    return new Response("Already initialized", { status: 200 });
  }

  // Set initial values
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      credits: 9,
      freeTrialUses: 0,
    },
  });

  return new Response("Initialized", { status: 200 });
}