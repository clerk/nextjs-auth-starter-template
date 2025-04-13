"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RidesList, Ride } from "@/components/rides/rides-list"

// Import mock rides data
const mockRides: Ride[] = [
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
  {
    id: "5",
    rideNumber: "RD-005",
    passengerName: "Michael Johnson",
    chauffeurName: "Sarah Wilson",
    pickupAddress: "Times Square, New York, NY",
    dropoffAddress: "Brooklyn Bridge, New York, NY",
    pickupTime: "2023-05-18T14:00:00Z",
    status: "SCHEDULED",
    category: "CITY_TRANSFER",
    fare: 85.00,
    distance: 7.3,
    duration: 35,
    createdAt: "2023-05-15T09:20:00Z",
  },
  {
    id: "6",
    rideNumber: "RD-006",
    passengerName: "Sarah Davis",
    chauffeurName: "Thomas Brown",
    pickupAddress: "Newark Liberty International Airport",
    dropoffAddress: "Wall Street, New York, NY",
    pickupTime: "2023-05-19T10:15:00Z",
    status: "SCHEDULED",
    category: "AIRPORT_TRANSFER",
    fare: 135.00,
    distance: 22.1,
    duration: 55,
    createdAt: "2023-05-15T11:45:00Z",
  },
];

export default function Page() {
  // Filter rides for today
  const [todayRides, setTodayRides] = useState<Ride[]>([]);

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
                <RidesList
                  rides={todayRides}
                  title="Today's Rides"
                  description="View and manage rides scheduled for today"
                  showSearch={false}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
