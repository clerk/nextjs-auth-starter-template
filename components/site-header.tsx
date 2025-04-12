"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Map of paths to their display names
const pathToTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/rides": "Rides",
  "/events": "Events",
  "/clients": "Clients",
  "/missions": "Missions",
  "/partners": "Partners",
  "/settings": "Settings",
  "/help": "Help",
}

export function SiteHeader() {
  const pathname = usePathname()

  // Get the base path (first segment)
  const basePath = `/${pathname.split("/")[1]}`

  // Get the title from the map, or use a capitalized version of the path
  const title = pathToTitle[basePath] ||
    basePath.substring(1).charAt(0).toUpperCase() + basePath.substring(2)

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  )
}
