"use client";

import { useState, useEffect } from "react";
import type { Event, EventFormValues } from "@/components/forms/event-form/types";
import { EventDialog } from "@/components/forms/event-form/event-dialog";
import { PlusIcon, Loader2, SearchIcon, Calendar, MapPin, Users, Building2, Clock, MoreHorizontal, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDebounce } from "@/lib/hooks/use-debounce";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce delay

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        let url = '/api/events';

        // Add filter if selected
        if (filterStatus) {
          url += `?status=${filterStatus}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();

        // Filter events based on search query if provided
        let filteredData = data;
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredData = data.filter((event: Event) =>
            event.title.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query) ||
            (event.client?.name && event.client.name.toLowerCase().includes(query))
          );
        }

        setEvents(filteredData);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filterStatus, debouncedSearchQuery]);

  // Log selected event when it changes
  useEffect(() => {
    if (selectedEvent) {
      console.log("Selected event for editing:", selectedEvent);
    }
  }, [selectedEvent]);

  // Handle event creation/update
  const handleEventSubmit = async (data: EventFormValues) => {
    try {
      const url = selectedEvent ? `/api/events/${selectedEvent.id}` : '/api/events';
      const method = selectedEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        throw new Error(errorData.error || 'Failed to save event');
      }

      toast.success(selectedEvent ? 'Event updated successfully' : 'Event created successfully');
      setEventDialogOpen(false);
      setSelectedEvent(null);

      // Refresh events list
      const eventsResponse = await fetch('/api/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      toast.success('Event deleted successfully');

      // Remove the event from the state
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
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
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Events</h1>
                    <p className="text-muted-foreground">
                      Manage all your events and activities
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => {
                      setSelectedEvent(null);
                      setEventDialogOpen(true);
                    }}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Event
                    </Button>
                    <EventDialog
                      open={eventDialogOpen}
                      onOpenChange={setEventDialogOpen}
                      onSubmit={handleEventSubmit}
                      defaultValues={selectedEvent || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <form className="flex w-full max-w-sm items-center space-x-2" onSubmit={(e) => e.preventDefault()}>
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setFilterStatus(null)}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("PLANNED")}>Planned</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("IN_PROGRESS")}>In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("COMPLETED")}>Completed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("CANCELLED")}>Cancelled</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="grid" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">
                      {events.length} events found
                    </div>
                  </div>

                  {/* Grid View */}
                  <TabsContent value="grid" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : events.length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                          <p className="text-muted-foreground">No events found</p>
                        </div>
                      ) : (
                        events.map((event) => (
                          <Card key={event.id} className="overflow-hidden">
                            <CardHeader className="p-4 pb-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg font-semibold">
                                    {event.title}
                                  </CardTitle>
                                  <CardDescription className="line-clamp-1">
                                    {event.client?.name || "No client assigned"}
                                  </CardDescription>
                                </div>
                                <Badge className={cn(
                                  event.status === "PLANNED" && "bg-yellow-100 text-yellow-800",
                                  event.status === "IN_PROGRESS" && "bg-blue-100 text-blue-800",
                                  event.status === "COMPLETED" && "bg-green-100 text-green-800",
                                  event.status === "CANCELLED" && "bg-red-100 text-red-800"
                                )}>
                                  {event.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-3">
                              <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm">
                                    {format(new Date(event.startDate), "PPP")} - {format(new Date(event.endDate), "PPP")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <p className="text-sm line-clamp-1">{event.location || "No location specified"}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <p className="text-sm">Participants: {event.participants || 0}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <p className="text-sm line-clamp-1">{event.client?.name || "No client assigned"}</p>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                asChild
                              >
                                <a href={`/events/${event.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </a>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedEvent(event);
                                    setEventDialogOpen(true);
                                  }}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </CardFooter>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Table View */}
                  <TabsContent value="table" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                              </TableCell>
                            </TableRow>
                          ) : events.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                No events found
                              </TableCell>
                            </TableRow>
                          ) : (
                            events.map((event) => (
                              <TableRow key={event.id}>
                                <TableCell className="font-medium">{event.title}</TableCell>
                                <TableCell>{event.client?.name || "No client"}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{event.location}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-xs">Start: {format(new Date(event.startDate), "PP")}</span>
                                    <span className="text-xs">End: {format(new Date(event.endDate), "PP")}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn(
                                    event.status === "PLANNED" && "bg-yellow-100 text-yellow-800",
                                    event.status === "IN_PROGRESS" && "bg-blue-100 text-blue-800",
                                    event.status === "COMPLETED" && "bg-green-100 text-green-800",
                                    event.status === "CANCELLED" && "bg-red-100 text-red-800"
                                  )}>
                                    {event.status.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      asChild
                                    >
                                      <a href={`/events/${event.id}`}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                      </a>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedEvent(event);
                                        setEventDialogOpen(true);
                                      }}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                      </svg>
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500"
                                      onClick={() => handleDeleteEvent(event.id)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        <line x1="10" x2="10" y1="11" y2="17" />
                                        <line x1="14" x2="14" y1="11" y2="17" />
                                      </svg>
                                      <span className="sr-only">Delete</span>
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
                  <TabsContent value="upcoming" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : events.filter((event) => event.status === "IN_PROGRESS").length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                          <p className="text-muted-foreground">No in-progress events found</p>
                        </div>
                      ) : (
                        events
                          .filter((event) => event.status === "IN_PROGRESS")
                          .map((event) => (
                            <Card key={event.id}>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                  {event.title}
                                </CardTitle>
                                <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                                  {event.status}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(event.startDate), "PPP")} - {format(new Date(event.endDate), "PPP")}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {event.location}
                                </div>
                                <p className="text-sm mt-2">{event.description}</p>
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                <div className="text-xs font-medium">{event.client?.name}</div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEvent(event);
                                      setEventDialogOpen(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="planning" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : events.filter((event) => event.status === "PLANNED").length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                          <p className="text-muted-foreground">No planned events found</p>
                        </div>
                      ) : (
                        events
                          .filter((event) => event.status === "PLANNED")
                          .map((event) => (
                            <Card key={event.id}>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                  {event.title}
                                </CardTitle>
                                <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                                  {event.status}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(event.startDate), "PPP")} - {format(new Date(event.endDate), "PPP")}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {event.location}
                                </div>
                                <p className="text-sm mt-2">{event.description}</p>
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                <div className="text-xs font-medium">{event.client?.name}</div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEvent(event);
                                      setEventDialogOpen(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="completed" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : events.filter((event) => event.status === "COMPLETED").length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                          <p className="text-muted-foreground">No completed events found</p>
                        </div>
                      ) : (
                        events
                          .filter((event) => event.status === "COMPLETED")
                          .map((event) => (
                            <Card key={event.id}>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                  {event.title}
                                </CardTitle>
                                <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                                  {event.status}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(event.startDate), "PPP")} - {format(new Date(event.endDate), "PPP")}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {event.location}
                                </div>
                                <p className="text-sm mt-2">{event.description}</p>
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                <div className="text-xs font-medium">{event.client?.name}</div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEvent(event);
                                      setEventDialogOpen(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          ))
                      )}
                    </div>
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







