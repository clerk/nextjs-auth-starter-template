"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, TrashIcon, MapPinIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Define milestone schema for multiple stops
const milestoneSchema = z.object({
  address: z.string().min(1, "Address is required"),
  time: z.date().optional(),
  type: z.enum(["PICKUP", "DROPOFF"]),
  notes: z.string().optional(),
});

// Define a simple ride schema (for rides within a mission or standalone)
const simpleRideSchema = z.object({
  id: z.string().optional(),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({
    required_error: "Pickup time is required",
  }),
  category: z.string().min(1, "Category is required"),
  status: z.string().optional().default("SCHEDULED"),
  notes: z.string().optional(),
  fare: z.number().optional(),
  milestones: z.array(milestoneSchema).optional().default([]),
});

// Define mission schema
const missionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Mission title is required"),
  clientId: z.string().min(1, "Client is required"),
  chauffeurId: z.string().optional(),
  partnerId: z.string().optional(),
  isExternalPartner: z.boolean().optional().default(false),
  projectId: z.string().optional(),
  passengerIds: z.array(z.string()).optional().default([]),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  duration: z.number().optional().default(12), // Duration in hours, default 12 hours
  status: z.string().optional().default("SCHEDULED"),
  notes: z.string().optional(),
  totalBudget: z.number().optional(),
  partnerFee: z.number().optional(),
  rides: z.array(simpleRideSchema).optional().default([]),
});

// Passenger schema
const passengerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  passengerCount: z.number().min(1, "At least 1 passenger is required").default(1),
  description: z.string().optional(),
});

// Main form schema that can handle both simple rides and missions
const rideFormSchema = z.object({
  passengerId: z.string().optional(), // For selecting existing passengers
  passengerInfo: passengerSchema.optional(), // For new passenger information
  useExistingPassenger: z.boolean().default(true),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({
    required_error: "Pickup time is required",
  }),
  category: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
  fare: z.number().optional(),
  milestones: z.array(milestoneSchema).optional().default([]),
  isMission: z.boolean().optional().default(false),
  mission: missionSchema.optional(),
});

type SimpleRideFormValues = z.infer<typeof simpleRideSchema>;
type MissionFormValues = z.infer<typeof missionSchema>;
type RideFormValues = z.infer<typeof rideFormSchema>;

interface RideFormProps {
  onAddRide: (data: RideFormValues) => void;
  users?: { id: string; name: string }[];
  chauffeurs?: { id: string; name: string }[];
  clients?: { id: string; name: string }[];
  partners?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  existingMissions?: { id: string; title: string; chauffeurId: string }[];
  defaultValues?: Partial<RideFormValues>;
  buttonText?: string;
  showMissionButton?: boolean;
}

export function RideForm({
  onAddRide,
  users = [],
  chauffeurs = [],
  clients = [],
  partners = [],
  projects = [],
  existingMissions = [],
  defaultValues,
  buttonText = "Add Ride",
  showMissionButton = true
}: RideFormProps) {
  const form = useForm<RideFormValues>({
    resolver: zodResolver(rideFormSchema),
    defaultValues: {
      useExistingPassenger: defaultValues?.useExistingPassenger ?? true,
      passengerId: defaultValues?.passengerId || "",
      passengerInfo: defaultValues?.passengerInfo || {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        passengerCount: 1,
        description: "",
      },
      pickupAddress: defaultValues?.pickupAddress || "",
      dropoffAddress: defaultValues?.dropoffAddress || "",
      status: defaultValues?.status || "SCHEDULED",
      notes: defaultValues?.notes || "",
      category: defaultValues?.category || "CITY_TRANSFER",
      pickupTime: defaultValues?.pickupTime || new Date(),
      milestones: defaultValues?.milestones || [],
      isMission: defaultValues?.isMission || false,
      mission: defaultValues?.mission || {
        title: "",
        clientId: "",
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Default to next day
        rides: [],
      },
    },
  });

  // Set up field array for milestones
  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  // Set up field array for mission rides
  const { fields: missionRideFields, append: appendRide, remove: removeRide } = useFieldArray({
    control: form.control,
    name: "mission.rides",
  });

  // State for multi-step form
  const [currentStep, setCurrentStep] = useState(0);

  // Define the steps for the form
  const steps = [
    { id: "passenger", label: "Passenger" },
    { id: "ride-details", label: "Ride Details" },
    { id: "milestones", label: "Milestones" },
    isMission ? { id: "mission", label: "Mission" } : null,
    { id: "review", label: "Review" },
  ].filter(Boolean);

  // Function to go to the next step
  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  // Function to go to the previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Watch for form values that affect conditional rendering
  const isMission = form.watch("isMission");
  const category = form.watch("category");
  const selectedChauffeurId = form.watch("chauffeurId");
  const selectedPassengerId = form.watch("passengerId");
  const useExistingPassenger = form.watch("useExistingPassenger");

  // Function to check if chauffeur already has a mission
  const chauffeurHasMission = (chauffeurId: string) => {
    return existingMissions.some(mission => mission.chauffeurId === chauffeurId);
  };

  // Function to create a new mission
  const createNewMission = () => {
    // Set mission mode to true
    form.setValue("isMission", true);

    // Set default mission values
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create a default mission title based on passenger name if available
    const passenger = users.find(user => user.id === selectedPassengerId);
    const missionTitle = passenger ? `Mission for ${passenger.name}` : "New Mission";

    form.setValue("mission.title", missionTitle);
    form.setValue("mission.startDate", today);
    form.setValue("mission.endDate", tomorrow);
    form.setValue("mission.duration", 12); // Default 12 hours

    // If chauffeur is selected, assign them to the mission
    if (selectedChauffeurId) {
      form.setValue("mission.chauffeurId", selectedChauffeurId);
    }

    // If passenger is selected, add them to the mission passengers
    if (selectedPassengerId) {
      form.setValue("mission.passengerIds", [selectedPassengerId]);
    }
  };

  // Handle form submission
  const handleSubmit = (data: RideFormValues) => {
    // If not a mission but chauffeur is selected and doesn't have a mission, create one
    if (!data.isMission && data.chauffeurId && !chauffeurHasMission(data.chauffeurId)) {
      // Auto-create mission for the chauffeur
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get chauffeur name for the mission title
      const chauffeur = chauffeurs.find(c => c.id === data.chauffeurId);
      const chauffeurName = chauffeur ? chauffeur.name : data.chauffeurId;

      // Get passenger name if available
      const passenger = users.find(u => u.id === data.passengerId);
      const passengerName = passenger ? passenger.name : "Client";

      // Create a default mission
      data.isMission = true;
      data.mission = {
        ...data.mission,
        title: `Mission for ${passengerName} with ${chauffeurName}`,
        chauffeurId: data.chauffeurId,
        clientId: data.passengerId ? data.passengerId : "", // Use passenger as client if available
        passengerIds: data.passengerId ? [data.passengerId] : [],
        startDate: today,
        endDate: tomorrow,
        duration: 12,
        rides: [{
          pickupAddress: data.pickupAddress,
          dropoffAddress: data.dropoffAddress,
          pickupTime: data.pickupTime,
          category: data.category,
          status: data.status,
        }]
      };

      console.log("Automatically created mission for chauffeur:", chauffeurName);
    }

    onAddRide(data);
    form.reset();
  };

  // Function to validate the current step before proceeding
  const validateStep = async () => {
    let isValid = true;

    // Define which fields to validate for each step
    const fieldsToValidate = {
      passenger: isMission ? [] : ['passengerId', 'passengerInfo'],
      'ride-details': ['pickupAddress', 'dropoffAddress', 'pickupTime', 'category', 'status'],
      milestones: [],
      mission: isMission ? ['mission.title', 'mission.clientId', 'mission.startDate', 'mission.endDate'] : [],
      review: [],
    };

    // Get the current step ID
    const currentStepId = steps[currentStep]?.id;

    // If we have fields to validate for this step
    if (currentStepId && fieldsToValidate[currentStepId]) {
      // Trigger validation for the specified fields
      const result = await form.trigger(fieldsToValidate[currentStepId] as any);
      isValid = result;
    }

    return isValid;
  };

  // Handle next button click
  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-xs font-medium ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {step.label}
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Passenger Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Passenger Information</h3>

              <FormField
                control={form.control}
                name="useExistingPassenger"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Use Existing Passenger</FormLabel>
                      <FormDescription>
                        Toggle to select an existing passenger or enter new passenger details
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {useExistingPassenger ? (
                <FormField
                  control={form.control}
                  name="passengerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passenger</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a passenger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="passengerInfo.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passengerInfo.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passengerInfo.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passengerInfo.passengerCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Passengers</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            onChange={(e) => {
                              const value = e.target.value === "" ? 1 : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passengerInfo.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional information about the passenger"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
          />
        </div>

        {/* Create Mission Button */}
        {showMissionButton && !isMission && selectedChauffeurId && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={createNewMission}
            >
              Create Mission for Chauffeur
            </Button>
          </div>
        )}

        {/* Mission Toggle */}
        <FormField
          control={form.control}
          name="isMission"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Mission Mode</FormLabel>
                <FormDescription>
                  Enable for multi-day chauffeur assignments with multiple rides
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Mission Details */}
        {isMission && (
          <Card className="border-dashed">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">Mission Details</h3>

              <FormField
                control={form.control}
                name="mission.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mission title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="mission.clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission.isExternalPartner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>External Partner</FormLabel>
                        <FormDescription>
                          Enable to use an external partner instead of internal chauffeur
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Partner or Chauffeur Selection */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {form.watch("mission.isExternalPartner") ? (
                  <FormField
                    control={form.control}
                    name="mission.partnerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External Partner</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a partner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {partners.map((partner) => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="mission.chauffeurId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chauffeur</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a chauffeur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chauffeurs.map((chauffeur) => (
                              <SelectItem key={chauffeur.id} value={chauffeur.id}>
                                {chauffeur.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="mission.projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Passengers Selection */}
              <FormField
                control={form.control}
                name="mission.passengerIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passengers</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`passenger-${user.id}`}
                            checked={field.value?.includes(user.id)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              if (checked) {
                                field.onChange([...currentValues, user.id]);
                              } else {
                                field.onChange(currentValues.filter(id => id !== user.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={`passenger-${user.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {user.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="mission.startDate"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission.endDate"
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
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="mission.duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="0.5"
                          placeholder="12"
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission.totalBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("mission.isExternalPartner") && (
                <FormField
                  control={form.control}
                  name="mission.partnerFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Fee (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Rides in this Mission</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendRide({
                      pickupAddress: "",
                      dropoffAddress: "",
                      pickupTime: new Date(),
                      category: "CITY_TRANSFER",
                      status: "SCHEDULED",
                    })}
                  >
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Add Ride
                  </Button>
                </div>

                {missionRideFields.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground">No rides added yet. Click "Add Ride" to create rides for this mission.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {missionRideFields.map((item, index) => (
                      <Card key={item.id} className="relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => removeRide(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name={`mission.rides.${index}.category`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ride Type</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select ride type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {["CITY_TRANSFER", "AIRPORT_TRANSFER", "TRAIN_STATION_TRANSFER"].map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category === "CITY_TRANSFER" ? "City Transfer" :
                                           category === "AIRPORT_TRANSFER" ? "Airport Transfer" :
                                           category === "TRAIN_STATION_TRANSFER" ? "Train Station Transfer" :
                                           category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`mission.rides.${index}.pickupTime`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Pickup Time</FormLabel>
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
                                            format(field.value, "PPP HH:mm")
                                          ) : (
                                            <span>Pick a date and time</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                          if (date) {
                                            const currentDate = field.value || new Date();
                                            const newDate = new Date(date);
                                            newDate.setHours(currentDate.getHours());
                                            newDate.setMinutes(currentDate.getMinutes());
                                            field.onChange(newDate);
                                          }
                                        }}
                                        initialFocus
                                      />
                                      <div className="border-t p-3">
                                        <Input
                                          type="time"
                                          onChange={(e) => {
                                            const [hours, minutes] = e.target.value.split(':').map(Number);
                                            const date = field.value || new Date();
                                            date.setHours(hours);
                                            date.setMinutes(minutes);
                                            field.onChange(new Date(date));
                                          }}
                                          value={field.value ?
                                            `${field.value.getHours().toString().padStart(2, '0')}:${field.value.getMinutes().toString().padStart(2, '0')}`
                                            : ""}
                                        />
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                            <FormField
                              control={form.control}
                              name={`mission.rides.${index}.pickupAddress`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pickup Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter pickup address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`mission.rides.${index}.dropoffAddress`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dropoff Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter dropoff address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

          {/* Step 2: Ride Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Ride Details</h3>

              {!isMission && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ride Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ride type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["CITY_TRANSFER", "AIRPORT_TRANSFER", "TRAIN_STATION_TRANSFER", "CHAUFFEUR_SERVICE"].map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === "CITY_TRANSFER" ? "City Transfer" :
                               category === "AIRPORT_TRANSFER" ? "Airport Transfer" :
                               category === "TRAIN_STATION_TRANSFER" ? "Train Station Transfer" :
                               category === "CHAUFFEUR_SERVICE" ? "Chauffeur Service (Mise à disposition)" :
                               category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pickup address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoffAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter dropoff address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pickupTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pickup Time</FormLabel>
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
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const currentDate = field.value || new Date();
                                const newDate = new Date(date);
                                newDate.setHours(currentDate.getHours());
                                newDate.setMinutes(currentDate.getMinutes());
                                field.onChange(newDate);
                              }
                            }}
                            initialFocus
                          />
                          <div className="border-t p-3">
                            <Input
                              type="time"
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const date = field.value || new Date();
                                date.setHours(hours);
                                date.setMinutes(minutes);
                                field.onChange(new Date(date));
                              }}
                              value={field.value ?
                                `${field.value.getHours().toString().padStart(2, '0')}:${field.value.getMinutes().toString().padStart(2, '0')}`
                                : ""}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["SCHEDULED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes about this ride"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fare (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value === undefined ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Milestones */}
          {currentStep === 2 && !isMission && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Milestones</h3>
              <p className="text-sm text-muted-foreground">Add multiple pickup and dropoff points for this ride</p>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendMilestone({
                    address: "",
                    type: "PICKUP",
                  })}
                >
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Add Milestone
                </Button>
              </div>

              {milestoneFields.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-sm text-muted-foreground">No milestones added yet. Click "Add Milestone" to add pickup or dropoff points.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestoneFields.map((item, index) => (
                    <Card key={item.id} className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => removeMilestone(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`milestones.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="PICKUP">
                                      <div className="flex items-center">
                                        <MapPinIcon className="mr-2 h-4 w-4 text-green-500" />
                                        Pickup
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="DROPOFF">
                                      <div className="flex items-center">
                                        <MapPinIcon className="mr-2 h-4 w-4 text-red-500" />
                                        Dropoff
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`milestones.${index}.time`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Time (Optional)</FormLabel>
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
                                          format(field.value, "PPP HH:mm")
                                        ) : (
                                          <span>Pick a date and time</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        if (date) {
                                          const currentDate = field.value || new Date();
                                          const newDate = new Date(date);
                                          newDate.setHours(currentDate.getHours());
                                          newDate.setMinutes(currentDate.getMinutes());
                                          field.onChange(newDate);
                                        }
                                      }}
                                      initialFocus
                                    />
                                    <div className="border-t p-3">
                                      <Input
                                        type="time"
                                        onChange={(e) => {
                                          const [hours, minutes] = e.target.value.split(':').map(Number);
                                          const date = field.value || new Date();
                                          date.setHours(hours);
                                          date.setMinutes(minutes);
                                          field.onChange(new Date(date));
                                        }}
                                        value={field.value ?
                                          `${field.value.getHours().toString().padStart(2, '0')}:${field.value.getMinutes().toString().padStart(2, '0')}`
                                          : ""}
                                      />
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name={`milestones.${index}.address`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name={`milestones.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter any additional notes about this milestone"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Mission (if isMission is true) */}
          {currentStep === 3 && isMission && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Mission Details</h3>
              <p className="text-sm text-muted-foreground">Configure the mission settings for this ride</p>

              <FormField
                control={form.control}
                name="mission.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mission title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="mission.clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission.isExternalPartner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>External Partner</FormLabel>
                        <FormDescription>
                          Enable to use an external partner instead of internal chauffeur
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Partner or Chauffeur Selection */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {form.watch("mission.isExternalPartner") ? (
                  <FormField
                    control={form.control}
                    name="mission.partnerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External Partner</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a partner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {partners.map((partner) => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="mission.chauffeurId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chauffeur</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a chauffeur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chauffeurs.map((chauffeur) => (
                              <SelectItem key={chauffeur.id} value={chauffeur.id}>
                                {chauffeur.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="mission.projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="mission.startDate"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission.endDate"
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
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === (isMission ? 4 : 3) && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Review Your Ride</h3>
              <p className="text-sm text-muted-foreground">Please review the details of your ride before submitting</p>

              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-base font-medium mb-2">Passenger Information</h4>
                    {useExistingPassenger ? (
                      <p>
                        <span className="font-medium">Passenger:</span> {users.find(u => u.id === selectedPassengerId)?.name || "Not selected"}
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">Name:</span> {form.getValues("passengerInfo.firstName")} {form.getValues("passengerInfo.lastName")}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {form.getValues("passengerInfo.phoneNumber") || "Not provided"}
                        </p>
                        <p>
                          <span className="font-medium">Passengers:</span> {form.getValues("passengerInfo.passengerCount")}
                        </p>
                        {form.getValues("passengerInfo.description") && (
                          <p>
                            <span className="font-medium">Description:</span> {form.getValues("passengerInfo.description")}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-base font-medium mb-2">Ride Details</h4>
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Type:</span> {
                          form.getValues("category") === "CITY_TRANSFER" ? "City Transfer" :
                          form.getValues("category") === "AIRPORT_TRANSFER" ? "Airport Transfer" :
                          form.getValues("category") === "TRAIN_STATION_TRANSFER" ? "Train Station Transfer" :
                          form.getValues("category") === "CHAUFFEUR_SERVICE" ? "Chauffeur Service" :
                          form.getValues("category")
                        }
                      </p>
                      <p>
                        <span className="font-medium">Pickup:</span> {form.getValues("pickupAddress")}
                      </p>
                      <p>
                        <span className="font-medium">Dropoff:</span> {form.getValues("dropoffAddress")}
                      </p>
                      <p>
                        <span className="font-medium">Pickup Time:</span> {format(form.getValues("pickupTime"), "PPP HH:mm")}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span> {form.getValues("status")}
                      </p>
                      {form.getValues("fare") && (
                        <p>
                          <span className="font-medium">Fare:</span> ${form.getValues("fare")}
                        </p>
                      )}
                      {form.getValues("notes") && (
                        <p>
                          <span className="font-medium">Notes:</span> {form.getValues("notes")}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {!isMission && milestoneFields.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-base font-medium mb-2">Milestones</h4>
                      <div className="space-y-2">
                        {milestoneFields.map((milestone, index) => (
                          <div key={milestone.id} className="border-b pb-2 last:border-0">
                            <p>
                              <span className="font-medium">{index + 1}. {form.getValues(`milestones.${index}.type`) === "PICKUP" ? "Pickup" : "Dropoff"}:</span> {form.getValues(`milestones.${index}.address`)}
                            </p>
                            {form.getValues(`milestones.${index}.time`) && (
                              <p className="text-sm text-muted-foreground">
                                Time: {format(form.getValues(`milestones.${index}.time`), "PPP HH:mm")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isMission && (
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-base font-medium mb-2">Mission Details</h4>
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">Title:</span> {form.getValues("mission.title")}
                        </p>
                        <p>
                          <span className="font-medium">Client:</span> {clients.find(c => c.id === form.getValues("mission.clientId"))?.name || "Not selected"}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span> {form.getValues("mission.duration")} hours
                        </p>
                        <p>
                          <span className="font-medium">Dates:</span> {format(form.getValues("mission.startDate"), "PPP")} to {format(form.getValues("mission.endDate"), "PPP")}
                        </p>
                        {form.getValues("mission.isExternalPartner") ? (
                          <p>
                            <span className="font-medium">Partner:</span> {partners.find(p => p.id === form.getValues("mission.partnerId"))?.name || "Not selected"}
                          </p>
                        ) : (
                          <p>
                            <span className="font-medium">Chauffeur:</span> {chauffeurs.find(c => c.id === form.getValues("mission.chauffeurId"))?.name || "Not selected"}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between space-x-4 pt-6">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}

          <div className="flex-1"></div>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
            >
              Next
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit">{buttonText}</Button>
          )}
        </div>
      </form>
    </Form>
    </div>
  );
}
