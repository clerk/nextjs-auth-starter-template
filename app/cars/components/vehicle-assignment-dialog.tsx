"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { assignVehicle } from "../actions";
import { getEvents, createEventVehicleAssignment } from "../actions/event-actions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CheckIcon, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { EventDialog } from "@/components/forms/event-form/event-dialog";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Event type definition
type Event = {
  id: string;
  name: string;
  clientName: string;
  startDate: Date;
  endDate: Date;
  status: string;
  location: string;
};

// Mission type definition
type Mission = {
  id: string;
  name: string;
  eventId: string;
};

// Ride type definition
type Ride = {
  id: string;
  name: string;
  missionId: string;
};

// Chauffeur type definition
type Chauffeur = {
  id: string;
  name: string;
};

// Mock data for types that aren't implemented yet
const mockPremierEvents = [
  { id: "pe1", name: "VIP Conference 2025" },
  { id: "pe2", name: "International Summit 2025" },
];

const mockMissions = [
  { id: "m1", name: "Day 1 Transportation", eventId: "e1" },
  { id: "m2", name: "Day 2 Transportation", eventId: "e1" },
  { id: "m3", name: "VIP Transfers", eventId: "e2" },
];

const mockRides = [
  { id: "r1", name: "Airport to Hotel", missionId: "m1" },
  { id: "r2", name: "Hotel to Conference", missionId: "m1" },
  { id: "r3", name: "Conference to Restaurant", missionId: "m2" },
];

const mockChauffeurs = [
  { id: "c1", name: "John Smith" },
  { id: "c2", name: "Emma Johnson" },
  { id: "c3", name: "Michael Brown" },
];

// Define the form schema
// The assignmentType follows the hierarchical order: Premier Event > Event > Mission > Ride > Chauffeur
const assignmentSchema = z.object({
  // Assignment type in hierarchical order (highest to lowest)
  assignmentType: z.enum(["PREMIER_EVENT", "EVENT", "MISSION", "RIDE", "CHAUFFEUR"]),
  entityId: z.string().min(1, "Please select an entity"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface VehicleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  vehicleName: string;
}

export function VehicleAssignmentDialog({
  open,
  onOpenChange,
  vehicleId,
  vehicleName,
}: VehicleAssignmentDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("EVENT");
  const [entities, setEntities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  // Initialize the form
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      assignmentType: "EVENT",
      entityId: "",
      notes: "",
    },
  });

  // Fetch events when the dialog opens
  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open]);

  // Fetch events from the server
  const fetchEvents = async () => {
    try {
      setIsLoadingEntities(true);
      console.log('Calling getEvents() from component');
      const result = await getEvents();
      console.log('getEvents result:', result);

      if (result.success) {
        setEvents(result.data);
        setEntities(result.data);
        console.log('Set entities to:', result.data);
      } else {
        console.error('Failed to fetch events:', result.error);
        toast.error(result.error || "Failed to fetch events");
        setEntities([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
      setEntities([]);
    } finally {
      setIsLoadingEntities(false);
    }
  };

  // Handle assignment type change
  const handleAssignmentTypeChange = (value: string) => {
    form.setValue("assignmentType", value as any);
    form.setValue("entityId", "");
    setSelectedType(value);

    // Load entities based on the selected type
    switch (value) {
      case "PREMIER_EVENT":
        setEntities(mockPremierEvents);
        break;
      case "EVENT":
        setIsLoadingEntities(true);
        fetchEvents();
        break;
      case "MISSION":
        setEntities(mockMissions);
        break;
      case "RIDE":
        setEntities(mockRides);
        break;
      case "CHAUFFEUR":
        setEntities(mockChauffeurs);
        break;
      default:
        setEntities([]);
    }
  };

  // Handle event creation
  const handleEventCreated = async (eventData: any) => {
    // Close the event dialog
    setEventDialogOpen(false);

    // Refresh the events list
    await fetchEvents();

    // Show success message
    toast.success("Event created successfully");
  };

  // Filter entities based on search term
  const filteredEntities = entities.filter((entity) =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const onSubmit = async (data: AssignmentFormValues) => {
    try {
      setIsLoading(true);

      // If the assignment type is EVENT, use the event-specific assignment function
      if (data.assignmentType === "EVENT") {
        const result = await createEventVehicleAssignment({
          eventId: data.entityId,
          vehicleId,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes,
        });

        if (result.success) {
          toast.success(`Vehicle assigned successfully to event`);
          onOpenChange(false);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to assign vehicle to event");
        }
      } else {
        // For other assignment types, use the generic function
        const result = await assignVehicle({
          vehicleId,
          assignmentType: data.assignmentType,
          entityId: data.entityId,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes,
        });

        if (result.success) {
          toast.success(`Vehicle assigned successfully to ${selectedType}`);
          onOpenChange(false);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to assign vehicle");
        }
      }
    } catch (error) {
      console.error("Error assigning vehicle:", error);
      toast.error("Failed to assign vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
          <DialogDescription>
            Assign {vehicleName} to a Premier Event, Event, Mission, Ride, or Chauffeur.
          </DialogDescription>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              className="text-xs"
            >
              Refresh Events
            </Button>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleAssignmentTypeChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PREMIER_EVENT">Premier Event</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                      <SelectItem value="MISSION">Mission</SelectItem>
                      <SelectItem value="RIDE">Ride</SelectItem>
                      <SelectItem value="CHAUFFEUR">Chauffeur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of entity to assign this vehicle to.
                    <span className="block mt-1 text-xs text-blue-600">
                      Hierarchy: Premier Event &gt; Event &gt; Mission &gt; Ride &gt; Chauffeur
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType && (
              <FormField
                control={form.control}
                name="entityId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select {selectedType.replace("_", " ").toLowerCase()}</FormLabel>
                    <Popover open={openCombobox} onOpenChange={(open) => {
                      setOpenCombobox(open);
                      // If opening the dropdown and we have events, show them
                      if (open && selectedType === "EVENT" && entities.length === 0) {
                        fetchEvents();
                      }
                    }}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? entities.find((entity) => entity.id === field.value)?.name
                              : `Select ${selectedType.replace("_", " ").toLowerCase()}`}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder={`Search ${selectedType.replace("_", " ").toLowerCase()}...`}
                            onValueChange={setSearchTerm}
                          />
                          <CommandEmpty>No {selectedType.replace("_", " ").toLowerCase()} found.</CommandEmpty>
                          {isLoadingEntities ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : (
                            <>
                              <CommandGroup>
                                {filteredEntities.map((entity) => (
                                  <CommandItem
                                    key={entity.id}
                                    value={entity.id}
                                    onSelect={() => {
                                      form.setValue("entityId", entity.id);
                                      setOpenCombobox(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        entity.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {entity.name}
                                    {selectedType === "EVENT" && (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        {entity.clientName}
                                      </span>
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>

                              {selectedType === "EVENT" && (
                                <CommandGroup heading="Actions">
                                  <CommandItem
                                    onSelect={() => {
                                      setOpenCombobox(false);
                                      setEventDialogOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium"
                                  >
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    Create New Event
                                  </CommandItem>
                                </CommandGroup>
                              )}
                            </>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select the specific {selectedType.replace("_", " ").toLowerCase()} to assign this vehicle to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the assignment starts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return startDate ? date < startDate : false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the assignment ends.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this assignment"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about the assignment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Vehicle
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Event Dialog for creating new events */}
      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        onSubmit={handleEventCreated}
      />
    </Dialog>
  );
}
