"use client"

import { useUser, UserButton } from "@clerk/nextjs"
import { MoreVerticalIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRef, useEffect } from "react"

export function CustomUserButton() {
  const { user, isLoaded } = useUser()
  const userButtonRef = useRef<HTMLDivElement>(null)

  // Get user's full name or fallback to email
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
  const displayName = fullName || (user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User')
  const email = user?.emailAddresses[0]?.emailAddress || ''

  // Handle click on the custom UI to trigger the Clerk UserButton
  const handleClick = () => {
    // Find the actual Clerk button and click it
    const clerkButton = userButtonRef.current?.querySelector('button')
    if (clerkButton) {
      clerkButton.click()
    }
  }

  return (
    <div
      className="w-full h-[42px] p-1.5 rounded-lg hover:bg-sidebar-accent flex items-center gap-2 cursor-pointer"
      onClick={handleClick}
    >
      {!isLoaded ? (
        // Loading state
        <div className="w-full flex items-center gap-2 animate-pulse">
          <div className="h-8 w-8 rounded-lg bg-sidebar-accent"></div>
          <div className="flex-1">
            <div className="h-4 w-24 bg-sidebar-accent rounded"></div>
            <div className="h-3 w-16 bg-sidebar-accent/70 rounded mt-1"></div>
          </div>
        </div>
      ) : (
        // Loaded state with user info
        <>
          {/* Custom avatar */}
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user?.imageUrl} alt={displayName} />
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User info */}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {email}
            </span>
          </div>

          <MoreVerticalIcon className="ml-auto size-4 text-muted-foreground" />

          {/* Hidden Clerk UserButton */}
          <div className="sr-only" ref={userButtonRef}>
            <UserButton />
          </div>
        </>
      )}
    </div>
  )
}
