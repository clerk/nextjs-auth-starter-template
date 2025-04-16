"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()

  // Function to get the page title based on the current path
  const getPageTitle = () => {
    // Remove leading slash and get the first segment of the path
    const segments = pathname.split("/").filter(Boolean)

    // If no segments, we're on the home page
    if (segments.length === 0) return "Home"

    // Get the first segment (main page)
    const mainPath = segments[0]

    // Handle specific paths
    switch (mainPath) {
      case "dashboard":
        return "Dashboard"
      case "events":
        return segments.length > 1 ? "Event Details" : "Events"
      case "rides":
        return segments.length > 1 ? "Ride Details" : "Rides"
      case "clients":
        return segments.length > 1 ? "Client Details" : "Clients"
      case "users":
        return segments.length > 1 ? "User Details" : "Users"
      case "chauffeurs":
        return segments.length > 1 ? "Chauffeur Details" : "Chauffeurs"
      case "cars":
        return segments.length > 1 ? "Vehicle Details" : "Vehicles"
      case "partners":
        return segments.length > 1 ? "Partner Details" : "Partners"
      case "settings":
        return "Settings"
      default:
        // Capitalize the first letter and return
        return mainPath.charAt(0).toUpperCase() + mainPath.slice(1)
    }
  }

  // Function to generate breadcrumb items
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 0) return []

    const breadcrumbs = []
    let path = ""

    segments.forEach((segment, index) => {
      path += `/${segment}`

      // Skip "new" segments in breadcrumbs
      if (segment === "new") return

      // Handle ID segments
      if (segment.match(/^\[.*\]$/) || segment.match(/^[0-9a-fA-F-]+$/)) {
        // This is an ID segment, use the previous segment's title + "Details"
        if (index > 0) {
          const prevSegment = segments[index - 1]
          const title = prevSegment.charAt(0).toUpperCase() + prevSegment.slice(1)
          breadcrumbs.push({
            title: `${title.endsWith("s") ? title.slice(0, -1) : title} Details`,
            path
          })
        }
      } else {
        // Regular segment
        breadcrumbs.push({
          title: segment.charAt(0).toUpperCase() + segment.slice(1),
          path
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const pageTitle = getPageTitle()

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {breadcrumbs.length > 0 ? (
          <div className="flex items-center">
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-base font-medium">{breadcrumb.title}</span>
                ) : (
                  <Link
                    href={breadcrumb.path}
                    className="text-base text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {breadcrumb.title}
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <h1 className="text-base font-medium">{pageTitle}</h1>
        )}
      </div>
    </header>
  )
}
