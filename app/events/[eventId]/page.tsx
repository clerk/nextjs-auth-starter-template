"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Building2, 
  Clock, 
  Users, 
  Car, 
  FileText, 
  Edit, 
  Trash2, 
  Loader2 
} from "lucide-react";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { EventDialog } from "@/components/forms/event-form/event-dialog";
import type { Event, EventFormValues } from "@/components/forms/event-form/types";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Event not found");
            router.push("/events");
            return;
          }
          throw new Error("Failed to fetch event details");
        }

        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast.error("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, router]);

  // Handle event update
  const handleEventUpdate = async (data: EventFormValues) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvent(updatedEvent);
      setEventDialogOpen(false);
      toast.success("Event updated successfully");
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      toast.success("Event deleted successfully");
      router.push("/events");
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      setIsDeleting(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Back button and header */}
              <div className="px-4 lg:px-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mb-4" 
                  asChild
                >
                  <Link href="/events">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Events
                  </Link>
                </Button>

                {isLoading ? (
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-6 w-24 animate-pulse rounded-full bg-muted"></div>
                  </div>
                ) : event ? (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
                      <div className="flex items-center mt-1 text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(event.startDate), "PPP")} - {format(new Date(event.endDate), "PPP")}
                      </div>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0 space-x-2">
                      <Badge className={cn("px-2 py-1", getStatusColor(event.status))}>
                        {event.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEventDialogOpen(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the event
                              and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteEvent}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h1 className="text-2xl font-bold tracking-tight">Event not found</h1>
                    <p className="text-muted-foreground mt-2">
                      The event you're looking for doesn't exist or has been deleted.
                    </p>
                  </div>
                )}
              </div>

              {/* Event details */}
              {!isLoading && event && (
                <div className="px-4 lg:px-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Event details card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {event.location && (
                          <div className="flex items-start">
                            <MapPin className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Location</div>
                              <div className="text-sm text-muted-foreground">{event.location}</div>
                            </div>
                          </div>
                        )}
                        
                        {event.client && (
                          <div className="flex items-start">
                            <Building2 className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Client</div>
                              <div className="text-sm text-muted-foreground">{event.client.name}</div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start">
                          <Clock className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Duration</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(event.startDate), "PPP")} - {format(new Date(event.endDate), "PPP")}
                            </div>
                          </div>
                        </div>
                        
                        {event.description && (
                          <div className="flex items-start">
                            <FileText className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Description</div>
                              <div className="text-sm text-muted-foreground">{event.description}</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Event stats card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                            <Users className="h-8 w-8 text-muted-foreground mb-2" />
                            <div className="text-2xl font-bold">
                              {event.participants?.length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Participants</div>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                            <Car className="h-8 w-8 text-muted-foreground mb-2" />
                            <div className="text-2xl font-bold">
                              {event.eventVehicles?.length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Vehicles</div>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center rounded-lg border p-4 col-span-2">
                            <div className="text-2xl font-bold">
                              {event.missions?.length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Missions</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabs for related data */}
                  <div className="mt-6">
                    <Tabs defaultValue="missions">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="missions">
                          Missions
                        </TabsTrigger>
                        <TabsTrigger value="participants">
                          Participants
                        </TabsTrigger>
                        <TabsTrigger value="vehicles">
                          Vehicles
                        </TabsTrigger>
                        <TabsTrigger value="schedule">
                          Schedule
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="missions" className="mt-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <CardTitle>Missions</CardTitle>
                              <CardDescription>
                                All missions for this event
                              </CardDescription>
                            </div>
                            <Button>
                              Add Mission
                            </Button>
                          </CardHeader>
                          <CardContent>
                            {event.missions && event.missions.length > 0 ? (
                              <div className="space-y-4">
                                {event.missions.map((mission) => (
                                  <Card key={mission.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-medium">{mission.title || `Mission ${mission.id.slice(0, 8)}`}</h3>
                                        <p className="text-sm text-muted-foreground">
                                          {mission.rides?.length || 0} rides
                                        </p>
                                      </div>
                                      <Badge>{mission.status}</Badge>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                      <Button variant="outline" size="sm">
                                        View Details
                                      </Button>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <h3 className="font-medium text-lg mb-2">No Missions Yet</h3>
                                <p className="text-muted-foreground mb-4">This event doesn't have any missions yet.</p>
                                <Button>Create First Mission</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="participants" className="mt-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <CardTitle>Participants</CardTitle>
                              <CardDescription>
                                People involved in this event
                              </CardDescription>
                            </div>
                            <Button>
                              Add Participant
                            </Button>
                          </CardHeader>
                          <CardContent>
                            {event.participants && event.participants.length > 0 ? (
                              <div className="space-y-4">
                                {event.participants.map((participant) => (
                                  <Card key={participant.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-medium">
                                          {participant.user?.firstName} {participant.user?.lastName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {participant.user?.email}
                                        </p>
                                      </div>
                                      <Badge>{participant.role}</Badge>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <h3 className="font-medium text-lg mb-2">No Participants Yet</h3>
                                <p className="text-muted-foreground mb-4">This event doesn't have any participants yet.</p>
                                <Button>Add First Participant</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="vehicles" className="mt-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <CardTitle>Vehicles</CardTitle>
                              <CardDescription>
                                Vehicles assigned to this event
                              </CardDescription>
                            </div>
                            <Button>
                              Assign Vehicle
                            </Button>
                          </CardHeader>
                          <CardContent>
                            {event.eventVehicles && event.eventVehicles.length > 0 ? (
                              <div className="space-y-4">
                                {event.eventVehicles.map((eventVehicle) => (
                                  <Card key={eventVehicle.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-medium">
                                          {eventVehicle.vehicle?.make} {eventVehicle.vehicle?.model}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {eventVehicle.vehicle?.licensePlate}
                                        </p>
                                      </div>
                                      <Badge>{eventVehicle.status}</Badge>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <h3 className="font-medium text-lg mb-2">No Vehicles Assigned</h3>
                                <p className="text-muted-foreground mb-4">This event doesn't have any vehicles assigned yet.</p>
                                <Button>Assign First Vehicle</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="schedule" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Event Schedule</CardTitle>
                            <CardDescription>
                              Timeline of activities for this event
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-8">
                              <h3 className="font-medium text-lg mb-2">Schedule Not Available</h3>
                              <p className="text-muted-foreground mb-4">The schedule for this event is not available yet.</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Event edit dialog */}
      {event && (
        <EventDialog
          open={eventDialogOpen}
          onOpenChange={setEventDialogOpen}
          onSubmit={handleEventUpdate}
          defaultValues={{
            title: event.title,
            description: event.description || "",
            clientId: event.clientId,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            status: event.status,
            location: event.location || "",
            pricingType: event.pricingType || "MISSION_BASED",
            fixedPrice: event.fixedPrice?.toString() || "",
            notes: event.notes || "",
          }}
        />
      )}
    </SidebarProvider>
  );
}
