"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPinIcon, ClockIcon, CarIcon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Import mock rides data from the rides page
const mockRides = [
  {
    id: "1",
    rideNumber: "RD-001",
    passengerName: "John Doe",
    chauffeurName: "Michael Smith",
    pickupAddress: "123 Main St, New York, NY",
    dropoffAddress: "456 Park Ave, New York, NY",
    pickupTime: "2023-05-15T10:30:00Z",
    status: "SCHEDULED",
    category: "CITY_TRANSFER",
    fare: 75.00,
    distance: 5.2,
    duration: 25,
    createdAt: "2023-05-14T14:30:00Z",
  },
  {
    id: "2",
    rideNumber: "RD-002",
    passengerName: "Jane Smith",
    chauffeurName: "David Johnson",
    pickupAddress: "789 Broadway, New York, NY",
    dropoffAddress: "JFK Airport, Terminal 4",
    pickupTime: "2023-05-16T08:00:00Z",
    status: "ASSIGNED",
    category: "AIRPORT_TRANSFER",
    fare: 120.00,
    distance: 18.5,
    duration: 45,
    createdAt: "2023-05-14T14:35:00Z",
  },
  {
    id: "3",
    rideNumber: "RD-003",
    passengerName: "Robert Brown",
    chauffeurName: "Robert Williams",
    pickupAddress: "Grand Central Terminal",
    dropoffAddress: "350 5th Ave, New York, NY",
    pickupTime: "2023-05-15T15:45:00Z",
    status: "IN_PROGRESS",
    category: "TRAIN_STATION_TRANSFER",
    fare: 65.00,
    distance: 3.8,
    duration: 20,
    createdAt: "2023-05-14T16:20:00Z",
  },
  {
    id: "4",
    rideNumber: "RD-004",
    passengerName: "Emily Johnson",
    chauffeurName: "James Brown",
    pickupAddress: "1 World Trade Center, New York, NY",
    dropoffAddress: "N/A (Hourly Service)",
    pickupTime: "2023-05-17T09:00:00Z",
    status: "SCHEDULED",
    category: "CHAUFFEUR_SERVICE",
    fare: 250.00,
    distance: 0,
    duration: 180,
    createdAt: "2023-05-14T18:10:00Z",
  },
];

// Helper function to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Get status badge color
function getStatusColor(status: string) {
  switch (status) {
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
    case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
    case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function Page() {
  // Filter rides for today
  const [todayRides, setTodayRides] = useState<typeof mockRides>([]);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For now, we'll filter the mock data to show only "today's" rides
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For demo purposes, let's pretend all rides are for today
    setTodayRides(mockRides);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              {/* Daily Rides Section */}
              <div className="px-4 lg:px-6">
                <h2 className="text-2xl font-bold mb-4">Today's Rides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todayRides.map((ride) => (
                    <Card key={ride.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{ride.rideNumber}</CardTitle>
                            <CardDescription>{ride.category.replace('_', ' ')}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(ride.status)}>
                            {ride.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <UserIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{ride.passengerName}</p>
                              <p className="text-xs text-muted-foreground">Chauffeur: {ride.chauffeurName}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">From: {ride.pickupAddress}</p>
                              <p className="text-sm font-medium">To: {ride.dropoffAddress}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{formatDate(ride.pickupTime)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CarIcon className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{ride.distance} km • {ride.duration} min • €{ride.fare.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/rides?id=${ride.id}`} className="w-full">
                          <Button variant="outline" className="w-full">View Details</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
