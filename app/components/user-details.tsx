"use client";

import { useOrganization, useSession, useUser } from "@clerk/nextjs";

function Row({
  desc,
  value,
  children,
}: {
  desc: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-8.5 grid grid-cols-2 items-center relative">
      <span className="text-xs font-semibold block shrink-0">{desc}</span>
      <span className="text-xs text-[#7D7D7E] font-mono block relative">
        <span className="block truncate w-full">{value}</span>
        {children}
      </span>
    </div>
  );
}

function PointerC({ label }: { label: string }) {
  return (
    <div className="absolute w-fit flex items-center gap-5 top-1/2 -translate-y-1/2 left-full">
      <div className="relative">
        <div className="h-px bg-[#BFBFC4] w-26" />
        <div className="size-1 bg-[#BFBFC4] rotate-45 absolute right-0 top-1/2 -translate-y-1/2" />
      </div>
      <div className="font-mono text-xs bg-black px-1.5 py-1 rounded-md text-white">
        {label}
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateWithNumbers(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function UserDetails() {
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();

  if (!user || !session) return null;

  return (
    <div className="p-16 rounded-lg border border-[#EDEDED] bg-[#F1F1F2] background relative">
      <div className="p-8 rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5 max-w-100">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-full relative flex justify-center">
            <img src={user.imageUrl} className="size-20 rounded-full" />
            <div className="absolute w-fit flex items-center gap-5 top-1/2 -translate-x-2.5 -translate-y-1/2 left-full">
              <div className="relative">
                <div className="h-px bg-[#BFBFC4] w-26" />
                <div className="size-1 bg-[#BFBFC4] rotate-45 absolute right-0 top-1/2 -translate-y-1/2" />
              </div>
              <div className="font-mono text-xs bg-black px-1.5 py-1 rounded-md text-white">
                user.imageUrl
              </div>
            </div>
          </div>
          {user.firstName && user.lastName ? (
            <h1 className="text-[1.0625rem] font-semibold relative w-full text-center">
              {user.firstName} {user.lastName}
              <div className="absolute w-fit flex items-center gap-5 top-1/2 -translate-x-2.5 -translate-y-1/2 left-full">
                <div className="relative">
                  <div className="h-px bg-[#BFBFC4] w-26" />
                  <div className="size-1 bg-[#BFBFC4] rotate-45 absolute right-0 top-1/2 -translate-y-1/2" />
                </div>
                <div className="font-mono text-xs bg-black px-1.5 py-1 rounded-md text-white">
                  user.firstName
                </div>
                <div className="font-mono text-xs bg-black px-1.5 py-1 rounded-md text-white -translate-x-3">
                  user.lastName
                </div>
              </div>
            </h1>
          ) : (
            <div className="h-4" />
          )}
        </div>

        <div className="px-2.5 bg-[#FAFAFB] rounded-lg divide-y divide-[#EEEEF0]">
          <Row desc="Email" value={user.emailAddresses[0].emailAddress}>
            <PointerC label="user.emailAddresses[0].emailAddress" />
          </Row>
          <Row desc="Last signed in" value={formatDate(user.lastSignInAt!)}>
            <PointerC label="user.lastSignInAt" />
          </Row>
          <Row desc="Joined on" value={formatDate(user.createdAt!)}>
            <PointerC label="user.createdAt" />
          </Row>
          <Row desc="User ID" value={user.id}>
            <PointerC label="user.user.id" />
          </Row>
        </div>
        <h2 className="mt-6 mb-4 text-[0.9375rem] font-semibold">
          Session details
        </h2>
        <div className="px-2.5 bg-[#FAFAFB] rounded-lg divide-y divide-[#EEEEF0]">
          <Row desc="Session ID" value={session.id}>
            <PointerC label="session.id" />
          </Row>
          <Row desc="Status" value={session.status}>
            <PointerC label="session.status" />
          </Row>
          <Row
            desc="Last active"
            value={formatDateWithNumbers(session.lastActiveAt)}
          >
            <PointerC label="session.lastActiveAt" />
          </Row>
          <Row
            desc="Session expiration"
            value={formatDateWithNumbers(session.expireAt)}
          >
            <PointerC label="session.expireAt" />
          </Row>
        </div>
        {organization ? (
          <>
            <h2 className="mt-6 mb-4 text-[0.9375rem] font-semibold">
              Organization detail
            </h2>
            <div className="px-2.5 bg-[#FAFAFB] rounded-lg divide-y divide-[#EEEEF0]">
              <Row desc="Organization ID" value={organization.id}>
                <PointerC label="organization.id" />
              </Row>
              <Row desc="Name" value={organization.name}>
                <PointerC label="organization.name" />
              </Row>
              <Row desc="Members" value={String(organization.membersCount)}>
                <PointerC label="organization.membersCount" />
              </Row>
              <Row
                desc="Pending invitations"
                value={String(organization.pendingInvitationsCount)}
              >
                <PointerC label="organization.pendingInvitationsCount" />
              </Row>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
