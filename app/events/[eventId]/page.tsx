"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Users, MapPin, Edit, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventVehicleAssignmentDialog } from "../components/event-vehicle-assignment-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for an event
const mockEvent = {
  id: "1",
  name: "Corporate Conference 2025",
  description: "Annual corporate conference for industry leaders",
  location: "Grand Hotel, Paris",
  startDate: "2025-06-15T09:00:00Z",
  endDate: "2025-06-17T18:00:00Z",
  status: "UPCOMING",
  clientId: "client1",
  clientName: "Acme Corporation",
  totalParticipants: 150,
  budget: 75000,
  createdAt: "2024-01-10T14:30:00Z",
};

// Mock data for missions
const mockMissions = [
  {
    id: "m1",
    name: "Airport Transfers - Day 1",
    description: "Pickup from Charles de Gaulle Airport",
    date: "2025-06-15T07:00:00Z",
    status: "PLANNED",
    chauffeurCount: 5,
    vehicleCount: 5,
  },
  {
    id: "m2",
    name: "Hotel to Conference Center - Day 1",
    description: "Morning transfers to the conference center",
    date: "2025-06-15T08:00:00Z",
    status: "PLANNED",
    chauffeurCount: 3,
    vehicleCount: 3,
  },
  {
    id: "m3",
    name: "Evening Dinner Transfers - Day 1",
    description: "Transfers to and from the gala dinner",
    date: "2025-06-15T19:00:00Z",
    status: "PLANNED",
    chauffeurCount: 4,
    vehicleCount: 4,
  },
];

// Mock data for participants
const mockParticipants = [
  {
    id: "p1",
    name: "John Smith",
    role: "VIP",
    email: "john.smith@example.com",
    phone: "+1234567890",
  },
  {
    id: "p2",
    name: "Emma Johnson",
    role: "Speaker",
    email: "emma.johnson@example.com",
    phone: "+1987654321",
  },
  {
    id: "p3",
    name: "Michael Brown",
    role: "Attendee",
    email: "michael.brown@example.com",
    phone: "+1122334455",
  },
];

// Mock data for vehicles
const mockVehicles = [
  {
    id: "v1",
    make: "Mercedes-Benz",
    model: "S-Class",
    licensePlate: "AB-123-CD",
    chauffeurName: "David Wilson",
    status: "ASSIGNED",
  },
  {
    id: "v2",
    make: "BMW",
    model: "7 Series",
    licensePlate: "EF-456-GH",
    chauffeurName: "Sarah Miller",
    status: "ASSIGNED",
  },
  {
    id: "v3",
    make: "Audi",
    model: "A8",
    licensePlate: "IJ-789-KL",
    chauffeurName: "Robert Taylor",
    status: "ASSIGNED",
  },
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [missions, setMissions] = useState(mockMissions);
  const [participants, setParticipants] = useState(mockParticipants);
  const [vehicles, setVehicles] = useState(mockVehicles);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch the event data from an API
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real app, you would fetch the event with the ID from params.eventId
        setEvent(mockEvent);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventId]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      // Same day event
      return `${formatDate(startDate)}, ${formatTime(startDate)} - ${formatTime(endDate)}`;
    } else {
      // Multi-day event
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-gray-100 text-gray-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      // In a real app, you would call an API here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success("Event deleted successfully");
      router.push("/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center">
                  <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h1 className="text-2xl font-bold">Loading event details...</h1>
                </div>
                <div className="h-96 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!event) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center">
                  <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h1 className="text-2xl font-bold">Event not found</h1>
                </div>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-60">
                    <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">The requested event could not be found.</p>
                    <Button onClick={() => router.push("/events")} className="mt-4">
                      Go to Events
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {/* Header with back button */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">{event.name}</h1>
                    <p className="text-muted-foreground">{event.clientName}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => router.push(`/events/${event.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/events/${event.id}/missions/new`)}>
                        Add Mission
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/events/${event.id}/participants/new`)}>
                        Add Participant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAssignmentDialogOpen(true)}>
                        Assign Vehicles
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={handleDeleteEvent}>
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Event details */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Event Details</CardTitle>
                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Date & Time</h3>
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDateRange(event.startDate, event.endDate)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
                      <p className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {event.location}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Client</h3>
                      <p className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        {event.clientName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Participants</h3>
                      <p className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        {event.totalParticipants} participants
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p>{event.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for Missions, Participants, and Vehicles */}
              <Tabs defaultValue="missions" className="mt-6">
                <TabsList>
                  <TabsTrigger value="missions">Missions</TabsTrigger>
                  <TabsTrigger value="participants">Participants</TabsTrigger>
                  <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                </TabsList>

                {/* Missions Tab */}
                <TabsContent value="missions" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Missions</h2>
                    <Button onClick={() => router.push(`/events/${event.id}/missions/new`)}>
                      Add Mission
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {missions.map((mission) => (
                      <Card key={mission.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{mission.name}</CardTitle>
                            <Badge className={mission.status === "PLANNED" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                              {mission.status}
                            </Badge>
                          </div>
                          <CardDescription>{formatDate(mission.date)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{mission.description}</p>
                          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                            <span>{mission.chauffeurCount} chauffeurs</span>
                            <span>{mission.vehicleCount} vehicles</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" onClick={() => router.push(`/events/${event.id}/missions/${mission.id}`)}>
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Participants Tab */}
                <TabsContent value="participants" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Participants</h2>
                    <Button onClick={() => router.push(`/events/${event.id}/participants/new`)}>
                      Add Participant
                    </Button>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Role</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">Phone</th>
                            <th className="text-right p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((participant) => (
                            <tr key={participant.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">{participant.name}</td>
                              <td className="p-4">
                                <Badge variant="outline">{participant.role}</Badge>
                              </td>
                              <td className="p-4">{participant.email}</td>
                              <td className="p-4">{participant.phone}</td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm" onClick={() => router.push(`/events/${event.id}/participants/${participant.id}`)}>
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vehicles Tab */}
                <TabsContent value="vehicles" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Assigned Vehicles</h2>
                    <Button onClick={() => setAssignmentDialogOpen(true)}>
                      Assign Vehicles
                    </Button>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Vehicle</th>
                            <th className="text-left p-4">License Plate</th>
                            <th className="text-left p-4">Chauffeur</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-right p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">{vehicle.make} {vehicle.model}</td>
                              <td className="p-4">{vehicle.licensePlate}</td>
                              <td className="p-4">{vehicle.chauffeurName}</td>
                              <td className="p-4">
                                <Badge variant="outline">{vehicle.status}</Badge>
                              </td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm" onClick={() => router.push(`/cars/${vehicle.id}`)}>
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
      <EventVehicleAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        eventId={event?.id || ""}
        eventName={event?.name || ""}
      />
    </SidebarProvider>
  );
}