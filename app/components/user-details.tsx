"use client";

import { useOrganization, useSession, useUser } from "@clerk/nextjs";

type RowProps = {
  desc: string;
  value: string;
  label: string;
};

function Row({ desc, value, label }: RowProps) {
  return (
    <div className="grid grid-cols-2 items-center h-8 relative text-xs">
      <span className="font-semibold">{desc}</span>
      <span className="text-gray-600 font-mono flex items-center">
        <span className="truncate">{value}</span>
        <Pointer label={label} />
      </span>
    </div>
  );
}

function Pointer({ label }: { label: string }) {
  return (
    <div className="absolute flex items-center gap-2 left-full top-1/2 transform -translate-y-1/2">
      <span className="h-px bg-gray-400 w-20 relative">
        <span className="size-1 bg-gray-400 rotate-45 absolute right-0 top-1/2 -translate-y-1/2" />
      </span>
      <span className="font-mono text-xs bg-black px-1 py-0.5 rounded-md text-white">
        {label}
      </span>
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
    <section className="p-8 border rounded-lg bg-gray-100 relative max-w-md">
      <div className="p-6 rounded-lg bg-white shadow-md ring-1 ring-gray-200">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="relative">
            <img src={user.imageUrl} className="size-20 rounded-full" alt="User Avatar" />
            <Pointer label="user.imageUrl" />
          </div>
          {user.firstName && user.lastName ? (
            <h1 className="text-base font-semibold relative">
              {user.firstName} {user.lastName}
              <Pointer label="user.firstName user.lastName" />
            </h1>
          ) : (
            <div className="h-4" />
          )}
        </div>

        <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
          <Row desc="Email" value={user.emailAddresses[0].emailAddress} label="user.emailAddresses[0].emailAddress" />
          <Row desc="Last signed in" value={formatDate(user.lastSignInAt!)} label="user.lastSignInAt" />
          <Row desc="Joined on" value={formatDate(user.createdAt!)} label="user.createdAt" />
          <Row desc="User ID" value={user.id} label="user.id" />
        </div>

        <h2 className="mt-6 mb-2 text-sm font-semibold">Session details</h2>
        <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
          <Row desc="Session ID" value={session.id} label="session.id" />
          <Row desc="Status" value={session.status} label="session.status" />
          <Row desc="Last active" value={formatDateTime(session.lastActiveAt)} label="session.lastActiveAt" />
          <Row desc="Session expiration" value={formatDateTime(session.expireAt)} label="session.expireAt" />
        </div>

        {organization && (
          <>
            <h2 className="mt-6 mb-2 text-sm font-semibold">Organization details</h2>
            <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
              <Row desc="Organization ID" value={organization.id} label="organization.id" />
              <Row desc="Name" value={organization.name} label="organization.name" />
              <Row desc="Members" value={String(organization.membersCount)} label="organization.membersCount" />
              <Row desc="Pending invitations" value={String(organization.pendingInvitationsCount)} label="organization.pendingInvitationsCount" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}