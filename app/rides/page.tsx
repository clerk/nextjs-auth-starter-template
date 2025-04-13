"use client";

import { useState, useEffect } from "react";
import { PlusIcon, Search as SearchIcon, MapPin as MapPinIcon, Clock as ClockIcon, Car as CarIcon, Loader2, Eye, MoreHorizontal, Users, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RideForm } from "../../components/forms/ride-form/RideForm";
import { RidesList, Ride } from "@/components/rides/rides-list";

// Mock data for rides
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
    passengerName: "John Doe",
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
    passengerName: "Jane Smith",
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
    passengerName: "Robert Johnson",
    chauffeurName: "James Brown",
    pickupAddress: "1 World Trade Center, New York, NY",
    dropoffAddress: "N/A (Hourly Service)",
    pickupTime: "2023-05-17T09:00:00Z",
    status: "SCHEDULED",
    category: "CHAUFFEUR_SERVICE",
    fare: 350.00,
    distance: 0,
    duration: 240,
    createdAt: "2023-05-15T10:15:00Z",
  },
  {
    id: "5",
    rideNumber: "RD-005",
    passengerName: "Emily Davis",
    chauffeurName: "William Jones",
    pickupAddress: "Newark Liberty Airport, Terminal B",
    dropoffAddress: "Times Square, New York, NY",
    pickupTime: "2023-05-16T13:20:00Z",
    status: "COMPLETED",
    category: "AIRPORT_TRANSFER",
    fare: 135.00,
    distance: 21.3,
    duration: 55,
    createdAt: "2023-05-15T11:45:00Z",
  },
  {
    id: "6",
    rideNumber: "RD-006",
    passengerName: "Sarah Wilson",
    chauffeurName: null,
    pickupAddress: "Central Park West, New York, NY",
    dropoffAddress: "Brooklyn Bridge, New York, NY",
    pickupTime: "2023-05-18T11:00:00Z",
    status: "CANCELLED",
    category: "CITY_TRANSFER",
    fare: 55.00,
    distance: 4.5,
    duration: 22,
    createdAt: "2023-05-15T14:30:00Z",
  },
];

// Mock data for users
const mockUsers = [
  { id: "user1", name: "John Doe" },
  { id: "user2", name: "Jane Smith" },
  { id: "user3", name: "Robert Johnson" },
  { id: "user4", name: "Emily Davis" },
  { id: "user5", name: "Michael Wilson" },
];

// Mock data for chauffeurs
const mockChauffeurs = [
  { id: "chauffeur1", name: "David Johnson" },
  { id: "chauffeur2", name: "Michael Smith" },
  { id: "chauffeur3", name: "Robert Williams" },
  { id: "chauffeur4", name: "James Brown" },
  { id: "chauffeur5", name: "William Jones" },
];

// Mock data for clients
const mockClients = [
  { id: "client1", name: "Acme Corp" },
  { id: "client2", name: "Wayne Enterprises" },
  { id: "client3", name: "Stark Industries" },
  { id: "client4", name: "Globex Corporation" },
  { id: "client5", name: "Initech" },
];

// Mock data for partners
const mockPartners = [
  { id: "partner1", name: "Elite Chauffeur Services" },
  { id: "partner2", name: "Premium Transportation" },
  { id: "partner3", name: "Luxury Rides Co." },
  { id: "partner4", name: "Executive Drivers Inc." },
  { id: "partner5", name: "VIP Transport Solutions" },
];

// Mock data for projects
const mockProjects = [
  { id: "project1", name: "Annual Conference 2023" },
  { id: "project2", name: "Executive Board Meeting" },
  { id: "project3", name: "Product Launch Event" },
  { id: "project4", name: "Client Visit - Paris Office" },
  { id: "project5", name: "Corporate Retreat" },
];

// Mock data for existing missions
const mockExistingMissions = [
  { id: "mission1", title: "Airport Transfers for Board Meeting", chauffeurId: "chauffeur1" },
  { id: "mission3", title: "VIP Client Visit", chauffeurId: "chauffeur3" },
];

export default function RidesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rideDialogOpen, setRideDialogOpen] = useState(false);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchTerm, 500); // 500ms debounce delay

  // Filter rides based on search term
  const filteredRides = mockRides.filter(ride =>
    ride.rideNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ride.chauffeurName && ride.chauffeurName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ride.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.dropoffAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get category display name
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "CITY_TRANSFER":
        return "City Transfer";
      case "AIRPORT_TRANSFER":
        return "Airport Transfer";
      case "TRAIN_STATION_TRANSFER":
        return "Train Station Transfer";
      case "CHAUFFEUR_SERVICE":
        return "Chauffeur Service";
      default:
        return category;
    }
  };

  // Handle ride creation
  const handleCreateRide = (data: any) => {
    console.log("Creating ride:", data);
    // In a real app, this would be an API call

    // Close the appropriate dialog based on whether it's a mission or not
    if (data.isMission) {
      setMissionDialogOpen(false);
    } else {
      setRideDialogOpen(false);
    }

    // Show success message or refresh data
    alert("Ride created successfully!");
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rides</h1>
                    <p className="text-muted-foreground">
                      Manage all your rides and transportation services
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog open={rideDialogOpen} onOpenChange={setRideDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setRideDialogOpen(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          New Ride
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                          <DialogTitle>Create New Ride</DialogTitle>
                          <DialogDescription>
                            Fill in the details to create a new ride.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <RideForm
                            onAddRide={handleCreateRide}
                            users={mockUsers}
                            chauffeurs={mockChauffeurs}
                            clients={mockClients}
                            partners={mockPartners}
                            projects={mockProjects}
                            existingMissions={mockExistingMissions}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={missionDialogOpen} onOpenChange={setMissionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setMissionDialogOpen(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Create Mission
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                          <DialogTitle>Create New Mission</DialogTitle>
                          <DialogDescription>
                            Create a mission for a chauffeur with multiple rides.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <RideForm
                            onAddRide={handleCreateRide}
                            users={mockUsers}
                            chauffeurs={mockChauffeurs}
                            clients={mockClients}
                            partners={mockPartners}
                            projects={mockProjects}
                            existingMissions={mockExistingMissions}
                            defaultValues={{ isMission: true }}
                            buttonText="Create Mission"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <form className="flex w-full max-w-sm items-center space-x-2" onSubmit={(e) => e.preventDefault()}>
                      <Input
                        placeholder="Search rides..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9"
                      />
                      <Button type="submit" variant="ghost" size="sm" className="h-9 px-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <SearchIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">Search</span>
                      </Button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Rides List with Tabs */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="table" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">
                      {filteredRides.length} rides found
                    </div>
                  </div>

                  {/* Table View */}
                  <TabsContent value="table" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ride #</TableHead>
                            <TableHead>Passenger</TableHead>
                            <TableHead>Pickup</TableHead>
                            <TableHead>Dropoff</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                              </TableCell>
                            </TableRow>
                          ) : filteredRides.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                No rides found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRides.map((ride) => (
                              <TableRow key={ride.id}>
                                <TableCell className="font-medium">{ride.rideNumber}</TableCell>
                                <TableCell>{ride.passengerName}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  <div className="flex items-center">
                                    <MapPinIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                                    <span className="truncate">{ride.pickupAddress}</span>
                                  </div>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <ClockIcon className="mr-1 h-3 w-3" />
                                    <span>{new Date(ride.pickupTime).toLocaleString()}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  <span className="truncate">{ride.dropoffAddress}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="px-1.5 text-xs">
                                    {getCategoryDisplayName(ride.category)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${getStatusColor(ride.status)} px-1.5 text-xs`}>
                                    {ride.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      asChild
                                    >
                                      <a href={`/rides/${ride.id}`}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                      </a>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* Grid View */}
                  <TabsContent value="grid" className="space-y-4">
                    <RidesList
                      rides={filteredRides}
                      title=""
                      description=""
                      showSearch={false}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}






