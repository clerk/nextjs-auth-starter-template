"use client";

import { useState, useEffect } from "react";
import type { Event, EventFormValues } from "@/components/forms/event-form/types";
import { EventDialog } from "@/components/forms/event-form/event-dialog";
import { PlusIcon, Loader2, Eye, LayoutGrid, List, Calendar, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filterStatus]);

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
                    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "table")}>
                      <ToggleGroupItem value="grid" aria-label="Grid View">
                        <LayoutGrid className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="table" aria-label="Table View">
                        <List className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
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
                        <DropdownMenuCheckboxItem
                          checked={filterStatus === null}
                          onClick={() => setFilterStatus(null)}
                        >
                          All
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStatus === "PLANNED"}
                          onClick={() => setFilterStatus("PLANNED")}
                        >
                          Planned
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStatus === "IN_PROGRESS"}
                          onClick={() => setFilterStatus("IN_PROGRESS")}
                        >
                          In Progress
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStatus === "COMPLETED"}
                          onClick={() => setFilterStatus("COMPLETED")}
                        >
                          Completed
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStatus === "CANCELLED"}
                          onClick={() => setFilterStatus("CANCELLED")}
                        >
                          Cancelled
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="all">All Events</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="planning">Planning</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-4">
                    {viewMode === "table" ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </TableCell>
                              </TableRow>
                            ) : events.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  <p className="text-muted-foreground">No events found</p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              events.map((event) => (
                                <TableRow key={event.id}>
                                  <TableCell>
                                    <Link
                                      href={`/events/${event.id}`}
                                      className="font-medium hover:underline hover:text-primary"
                                    >
                                      {event.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {event.description}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    {event.client?.name || "—"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span className="text-xs">
                                        {format(new Date(event.startDate), "MMM d, yyyy")}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {event.location ? (
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="text-xs line-clamp-1">{event.location}</span>
                                      </div>
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={cn("px-2 py-1", getStatusColor(event.status))}>
                                      {event.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <Link href={`/events/${event.id}`}>
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Link>
                                      </Button>
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
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
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
                          <Card key={event.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                {event.title}
                              </CardTitle>
                              <div className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getStatusColor(event.status)
                              )}>
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
                    )}
                  </TabsContent>
                  <TabsContent value="upcoming" className="space-y-4">
                    {viewMode === "table" ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </TableCell>
                              </TableRow>
                            ) : events.filter((event) => event.status === "IN_PROGRESS").length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  <p className="text-muted-foreground">No in-progress events found</p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              events
                                .filter((event) => event.status === "IN_PROGRESS")
                                .map((event) => (
                                <TableRow key={event.id}>
                                  <TableCell>
                                    <Link
                                      href={`/events/${event.id}`}
                                      className="font-medium hover:underline hover:text-primary"
                                    >
                                      {event.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {event.description}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    {event.client?.name || "—"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span className="text-xs">
                                        {format(new Date(event.startDate), "MMM d, yyyy")}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {event.location ? (
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="text-xs line-clamp-1">{event.location}</span>
                                      </div>
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={cn("px-2 py-1", getStatusColor(event.status))}>
                                      {event.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <Link href={`/events/${event.id}`}>
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Link>
                                      </Button>
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
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
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
                                  <Link
                                    href={`/events/${event.id}`}
                                    className="hover:underline hover:text-primary flex items-center gap-1"
                                  >
                                    {event.title}
                                  </Link>
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
                                    asChild
                                  >
                                    <Link href={`/events/${event.id}`}>
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Link>
                                  </Button>
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
                    )}
                  </TabsContent>
                  <TabsContent value="planning" className="space-y-4">
                    {viewMode === "table" ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </TableCell>
                              </TableRow>
                            ) : events.filter((event) => event.status === "PLANNED").length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  <p className="text-muted-foreground">No planned events found</p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              events
                                .filter((event) => event.status === "PLANNED")
                                .map((event) => (
                                <TableRow key={event.id}>
                                  <TableCell>
                                    <Link
                                      href={`/events/${event.id}`}
                                      className="font-medium hover:underline hover:text-primary"
                                    >
                                      {event.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {event.description}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    {event.client?.name || "—"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span className="text-xs">
                                        {format(new Date(event.startDate), "MMM d, yyyy")}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {event.location ? (
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="text-xs line-clamp-1">{event.location}</span>
                                      </div>
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={cn("px-2 py-1", getStatusColor(event.status))}>
                                      {event.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <Link href={`/events/${event.id}`}>
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Link>
                                      </Button>
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
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
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
                                  <Link
                                    href={`/events/${event.id}`}
                                    className="hover:underline hover:text-primary flex items-center gap-1"
                                  >
                                    {event.title}
                                  </Link>
                                </CardTitle>
                                <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(event.status))}>
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
                                    asChild
                                  >
                                    <Link href={`/events/${event.id}`}>
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Link>
                                  </Button>
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
                    )}
                  </TabsContent>
                  <TabsContent value="completed" className="space-y-4">
                    {viewMode === "table" ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </TableCell>
                              </TableRow>
                            ) : events.filter((event) => event.status === "COMPLETED").length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  <p className="text-muted-foreground">No completed events found</p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              events
                                .filter((event) => event.status === "COMPLETED")
                                .map((event) => (
                                <TableRow key={event.id}>
                                  <TableCell>
                                    <Link
                                      href={`/events/${event.id}`}
                                      className="font-medium hover:underline hover:text-primary"
                                    >
                                      {event.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {event.description}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    {event.client?.name || "—"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span className="text-xs">
                                        {format(new Date(event.startDate), "MMM d, yyyy")}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {event.location ? (
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="text-xs line-clamp-1">{event.location}</span>
                                      </div>
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={cn("px-2 py-1", getStatusColor(event.status))}>
                                      {event.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <Link href={`/events/${event.id}`}>
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Link>
                                      </Button>
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
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
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
                                  <Link
                                    href={`/events/${event.id}`}
                                    className="hover:underline hover:text-primary flex items-center gap-1"
                                  >
                                    {event.title}
                                  </Link>
                                </CardTitle>
                                <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(event.status))}>
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
                                    asChild
                                  >
                                    <Link href={`/events/${event.id}`}>
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Link>
                                  </Button>
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
                    )}
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







