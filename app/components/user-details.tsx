"use client";

import { useOrganization, useSession, useUser } from "@clerk/nextjs";

type RowProps = {
  desc: string;
  value: string;
  label: string;
};

function Row({ desc, value, label }: RowProps) {
  return (
    <div className="h-[2.125rem] grid grid-cols-2 items-center relative">
      <span className="text-xs font-semibold">{desc}</span>
      <span className="text-xs text-[#7D7D7E] font-mono relative flex items-center gap-2">
        <span className="truncate">{value}</span>
        <Pointer label={label} />
      </span>
    </div>
  );
}

function Pointer({ label }: { label: string }) {
  return (
    <div className="absolute w-fit flex items-center gap-2 left-full top-1/2 -translate-y-1/2">
      <div className="h-px bg-[#BFBFC4] w-[6.5rem] relative">
        <div className="size-1 bg-[#BFBFC4] rotate-45 absolute right-0 top-1/2 -translate-y-1/2" />
      </div>
      <div className="font-mono text-xs bg-black px-1.5 py-1 rounded-md text-white">
        {label}
      </div>
    </div>
  );
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateTime = (date: Date) =>
  date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

export function UserDetails() {
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();

  if (!user || !session) return null;

  return (
    <div className="p-16 rounded-lg border border-[#EDEDED] bg-[#F1F1F2] relative">
      <div className="p-8 rounded-xl bg-white shadow-lg ring-1 ring-gray-950/5 max-w-[25rem]">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="relative flex justify-center items-center gap-5">
            <img src={user.imageUrl} className="size-20 rounded-full" alt="User Avatar" />
            <Pointer label="user.imageUrl" />
          </div>
          {user.firstName && user.lastName ? (
            <h1 className="text-[1.0625rem] font-semibold relative">
              {user.firstName} {user.lastName}
              <Pointer label="user.firstName user.lastName" />
            </h1>
          ) : (
            <div className="h-4" />
          )}
        </div>

        <div className="px-2.5 bg-[#FAFAFB] rounded-lg divide-y divide-[#EEEEF0]">
          <Row desc="Email" value={user.emailAddresses[0].emailAddress} label="user.emailAddresses[0].emailAddress" />
          <Row desc="Last signed in" value={formatDate(user.lastSignInAt!)} label="user.lastSignInAt" />
          <Row desc="Joined on" value={formatDate(user.createdAt!)} label="user.createdAt" />
          <Row desc="User ID" value={user.id} label="user.id" />
        </div>

        <h2 className="mt-6 mb-4 text-[0.9375rem] font-semibold">Session details</h2>
        <div className="px-2.5 bg-[#FAFAFB] rounded-lg divide-y divide-[#EEEEF0]">
          <Row desc="Session ID" value={session.id} label="session.id" />
          <Row desc="Status" value={session.status} label="session.status" />
          <Row desc="Last active" value={formatDateTime(session.lastActiveAt)} label="session.lastActiveAt" />
          <Row desc="Session expiration" value={formatDateTime(session.expireAt)} label="session.expireAt" />
        </div>

        {organization && (
          <>
            <h2 className="mt-6 mb-4 text-[0.9375rem] font-semibold">Organization detail</h2>
            <div className="px-2.5 bg-[#FAFAFB] rounded-lg divide-y divide-[#EEEEF0]">
              <Row desc="Organization ID" value={organization.id} label="organization.id" />
              <Row desc="Name" value={organization.name} label="organization.name" />
              <Row desc="Members" value={String(organization.membersCount)} label="organization.membersCount" />
              <Row desc="Pending invitations" value={String(organization.pendingInvitationsCount)} label="organization.pendingInvitationsCount" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}