"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm, useFieldArray, Control, Path, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, TrashIcon, MapPinIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { z } from "zod";

// UI Components (Assuming these paths are correct)
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

// Libs
import { cn } from "@/lib/utils";

// --- Constants ---
const RIDE_STATUSES = ["SCHEDULED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const RIDE_CATEGORIES = ["CITY_TRANSFER", "AIRPORT_TRANSFER", "TRAIN_STATION_TRANSFER", "CHAUFFEUR_SERVICE"] as const;
const MISSION_RIDE_CATEGORIES = ["CITY_TRANSFER", "AIRPORT_TRANSFER", "TRAIN_STATION_TRANSFER"] as const;
const MILESTONE_TYPES = ["PICKUP", "DROPOFF"] as const;
const DEFAULT_DURATION = 12;
const DEFAULT_PASSENGER_COUNT = 1;

// --- Zod Schemas ---
const milestoneSchema = z.object({
  address: z.string().min(1, "Address is required"),
  time: z.date().optional(),
  type: z.enum(MILESTONE_TYPES),
  notes: z.string().optional(),
});

const simpleRideSchema = z.object({
  id: z.string().optional(),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({ required_error: "Pickup time is required" }),
  category: z.enum(MISSION_RIDE_CATEGORIES), // Use stricter categories for mission rides
  status: z.enum(RIDE_STATUSES).optional().default("SCHEDULED"),
  notes: z.string().optional(),
  fare: z.number().optional(),
  milestones: z.array(milestoneSchema).optional().default([]),
});

const missionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Mission title is required"),
  clientId: z.string().min(1, "Client is required"),
  chauffeurId: z.string().optional(),
  partnerId: z.string().optional(),
  isExternalPartner: z.boolean().optional().default(false),
  projectId: z.string().optional(),
  passengerIds: z.array(z.string()).optional().default([]),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  duration: z.number().optional().default(DEFAULT_DURATION),
  status: z.enum(RIDE_STATUSES).optional().default("SCHEDULED"),
  notes: z.string().optional(),
  totalBudget: z.number().optional(),
  partnerFee: z.number().optional(),
  rides: z.array(simpleRideSchema).optional().default([]), // Use simpleRideSchema here
});

const passengerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  passengerCount: z.number().min(1, "At least 1 passenger is required").default(DEFAULT_PASSENGER_COUNT),
  description: z.string().optional(),
});

const rideFormSchema = z.object({
  passengerId: z.string().optional(),
  passengerInfo: passengerSchema.optional(),
  useExistingPassenger: z.boolean().default(true),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({ required_error: "Pickup time is required" }),
  category: z.enum(RIDE_CATEGORIES), // Use broader categories for main form
  status: z.enum(RIDE_STATUSES),
  notes: z.string().optional(),
  fare: z.number().optional(),
  milestones: z.array(milestoneSchema).optional().default([]),
  isMission: z.boolean().optional().default(false),
  mission: missionSchema.optional(),
})
.refine(data => data.useExistingPassenger ? !!data.passengerId : !!data.passengerInfo, {
  message: "Please select an existing passenger or provide new passenger details.",
  path: ["passengerId"], // Apply error to passengerId field for simplicity
})
.refine(data => !data.useExistingPassenger ? !!data.passengerInfo?.firstName && !!data.passengerInfo?.lastName : true, {
  message: "First and last name are required for new passengers.",
  path: ["passengerInfo.firstName"], // Or lastName
});


// --- Types ---
type SimpleRideFormValues = z.infer<typeof simpleRideSchema>;
type MissionFormValues = z.infer<typeof missionSchema>;
type RideFormValues = z.infer<typeof rideFormSchema>;

type User = { id: string; name: string };
type Chauffeur = { id: string; name: string };
type Client = { id: string; name: string };
type Partner = { id: string; name: string };
type Project = { id: string; name: string };
type ExistingMission = { id: string; title: string; chauffeurId: string };

interface RideFormProps {
  onAddRide: (data: RideFormValues) => void;
  users?: User[];
  chauffeurs?: Chauffeur[];
  clients?: Client[];
  partners?: Partner[];
  projects?: Project[];
  existingMissions?: ExistingMission[];
  defaultValues?: Partial<RideFormValues>;
  buttonText?: string;
  showMissionButton?: boolean;
}

// --- Utility Functions ---

const getDefaultMissionValues = (): Partial<MissionFormValues> => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    title: "",
    clientId: "",
    startDate: today,
    endDate: tomorrow,
    duration: DEFAULT_DURATION,
    status: "SCHEDULED",
    isExternalPartner: false,
    passengerIds: [],
    rides: [],
    notes: "",
  };
};

const getDefaultRideValues = (defaults?: Partial<RideFormValues>): RideFormValues => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    useExistingPassenger: defaults?.useExistingPassenger ?? true,
    status: defaults?.status || "SCHEDULED",
    pickupAddress: defaults?.pickupAddress || "",
    dropoffAddress: defaults?.dropoffAddress || "",
    pickupTime: defaults?.pickupTime || new Date(),
    category: defaults?.category || "CITY_TRANSFER",
    passengerId: defaults?.passengerId || "",
    passengerInfo: {
      firstName: defaults?.passengerInfo?.firstName || "",
      lastName: defaults?.passengerInfo?.lastName || "",
      phoneNumber: defaults?.passengerInfo?.phoneNumber || "",
      passengerCount: defaults?.passengerInfo?.passengerCount ?? DEFAULT_PASSENGER_COUNT,
      description: defaults?.passengerInfo?.description || "",
    },
    notes: defaults?.notes || "",
    milestones: defaults?.milestones || [],
    isMission: defaults?.isMission || false,
    mission: {
      title: defaults?.mission?.title || "",
      clientId: defaults?.mission?.clientId || "",
      chauffeurId: defaults?.mission?.chauffeurId,
      partnerId: defaults?.mission?.partnerId,
      isExternalPartner: defaults?.mission?.isExternalPartner ?? false,
      projectId: defaults?.mission?.projectId,
      passengerIds: defaults?.mission?.passengerIds || [],
      startDate: defaults?.mission?.startDate || today,
      endDate: defaults?.mission?.endDate || tomorrow,
      duration: defaults?.mission?.duration ?? DEFAULT_DURATION,
      status: defaults?.mission?.status || "SCHEDULED",
      notes: defaults?.mission?.notes || "",
      totalBudget: defaults?.mission?.totalBudget,
      partnerFee: defaults?.mission?.partnerFee,
      rides: defaults?.mission?.rides || [],
    },
    fare: defaults?.fare,
  };
};

const getRideCategoryLabel = (category: typeof RIDE_CATEGORIES[number] | string): string => {
  switch (category) {
    case "CITY_TRANSFER": return "City Transfer";
    case "AIRPORT_TRANSFER": return "Airport Transfer";
    case "TRAIN_STATION_TRANSFER": return "Train Station Transfer";
    case "CHAUFFEUR_SERVICE": return "Chauffeur Service (Mise à disposition)";
    default: return category;
  }
};
const getMissionRideCategoryLabel = (category: typeof MISSION_RIDE_CATEGORIES[number] | string): string => {
  switch (category) {
    case "CITY_TRANSFER": return "City Transfer";
    case "AIRPORT_TRANSFER": return "Airport Transfer";
    case "TRAIN_STATION_TRANSFER": return "Train Station Transfer";
    default: return category;
  }
};

const getMilestoneTypeIcon = (type: typeof MILESTONE_TYPES[number]) => {
  return type === "PICKUP"
    ? <MapPinIcon className="mr-2 h-4 w-4 text-green-500" />
    : <MapPinIcon className="mr-2 h-4 w-4 text-red-500" />;
};


// --- Helper Components ---

interface DateTimePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  label: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, label }) => {
  const handleDateSelect = (selectedDate?: Date) => {
    if (selectedDate) {
      const currentDate = value || new Date();
      const newDate = new Date(selectedDate);
      newDate.setHours(currentDate.getHours());
      newDate.setMinutes(currentDate.getMinutes());
      onChange(newDate);
    } else {
      onChange(undefined); // Allow clearing the date
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const date = value || new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    onChange(new Date(date));
  };

  const timeValue = value ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}` : "";

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              {value ? format(value, "PPP HH:mm") : <span>Pick a date and time</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="border-t p-3">
            <Input
              type="time"
              onChange={handleTimeChange}
              value={timeValue}
            />
          </div>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  label: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
    return (
        <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                          variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                               !value && "text-muted-foreground"
                            )}
                        >
                          {value ? format(value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                        selected={value}
                        onSelect={onChange} // Directly use onChange
                      initialFocus
                    />
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    );
};


// --- Form Steps --- (Example structure - implement details for each step)

interface StepProps {
    form: UseFormReturn<RideFormValues>;
    users?: User[];
    clients?: Client[];
    chauffeurs?: Chauffeur[];
    partners?: Partner[];
    projects?: Project[];
}

const PassengerStep: React.FC<StepProps> = ({ form, users = [] }) => {
    const useExistingPassenger = form.watch("useExistingPassenger");

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Passenger Information</h3>
            <FormField
              control={form.control}
                name="useExistingPassenger"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Use Existing Passenger</FormLabel>
                            <FormDescription>Toggle to select or add new passenger.</FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                            <FormLabel>Select Passenger</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a passenger" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ) : (
                <div className="space-y-4 p-4 border rounded-md">
                     <h4 className="text-md font-medium mb-2">New Passenger Details</h4>
                    <FormField control={form.control} name="passengerInfo.firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="First Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="passengerInfo.lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Last Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="passengerInfo.phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone (Optional)</FormLabel><FormControl><Input placeholder="Phone Number" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                                        {...field} // Simplified handling
                                        onChange={e => field.onChange(e.target.value === "" ? DEFAULT_PASSENGER_COUNT : parseInt(e.target.value))}
                                        value={field.value ?? DEFAULT_PASSENGER_COUNT} // Ensure controlled component
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="passengerInfo.description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Passenger notes..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            )}
        </div>
    );
}

const RideDetailsStep: React.FC<StepProps & { isMission: boolean }> = ({ form, isMission }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Ride Details</h3>
            {!isMission && (
                <FormField
                  control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ride Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select ride type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {RIDE_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{getRideCategoryLabel(cat)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField control={form.control} name="pickupAddress" render={({ field }) => (<FormItem><FormLabel>Pickup Address</FormLabel><FormControl><Input placeholder="Pickup Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="dropoffAddress" render={({ field }) => (<FormItem><FormLabel>Dropoff Address</FormLabel><FormControl><Input placeholder="Dropoff Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="pickupTime"
                    render={({ field }) => <DateTimePicker label="Pickup Time" value={field.value} onChange={field.onChange} />}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {RIDE_STATUSES.map((status) => (<SelectItem key={status} value={status}>{status}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField control={form.control} name="fare" render={({ field }) => (<FormItem><FormLabel>Fare (Optional)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Ride Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Notes about this ride..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
    );
}

const MilestonesStep: React.FC<StepProps> = ({ form }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "milestones",
    });

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h3 className="text-lg font-medium">Milestones</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ address: "", type: "PICKUP" })} >
                    <PlusIcon className="mr-1 h-4 w-4" /> Add Milestone
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">Add multiple pickup and dropoff points for this ride (optional).</p>

            {fields.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground">No milestones added yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                  {fields.map((item, index) => (
                        <Card key={item.id} className="relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                      {MILESTONE_TYPES.map(type => (
                                                            <SelectItem key={type} value={type}>
                                                                <div className="flex items-center">
                                                                    {getMilestoneTypeIcon(type)} {type}
                                                                </div>
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
                                      name={`milestones.${index}.time`}
                                        render={({ field }) => <DateTimePicker label="Time (Optional)" value={field.value} onChange={field.onChange} />}
                                    />
                                </div>
                                <div className="mt-4">
                                    <FormField control={form.control} name={`milestones.${index}.address`} render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Enter address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="mt-4">
                                    <FormField control={form.control} name={`milestones.${index}.notes`} render={({ field }) => (<FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Milestone notes..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


const MissionStep: React.FC<StepProps> = ({ form, clients = [], chauffeurs = [], partners = [], projects = [], users = [] }) => {
    const { fields: missionRideFields, append: appendRide, remove: removeRide } = useFieldArray({
        control: form.control,
        name: "mission.rides",
    });
    const isExternalPartner = form.watch("mission.isExternalPartner");

    return (
        <Card className="border-dashed">
            <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">Mission Details</h3>
                 <FormField control={form.control} name="mission.title" render={({ field }) => (<FormItem><FormLabel>Mission Title</FormLabel><FormControl><Input placeholder="Mission Title" {...field} /></FormControl><FormMessage /></FormItem>)} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                     <FormField control={form.control} name="mission.clientId" render={({ field }) => (<FormItem><FormLabel>Client</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger></FormControl><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                     <FormField
                      control={form.control}
                        name="mission.isExternalPartner"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-auto mb-1.5"> {/* Adjusted margin */}
                                <div className="space-y-0.5">
                                    <FormLabel>Use External Partner</FormLabel>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Partner/Chauffeur/Project */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {isExternalPartner ? (
                        <FormField control={form.control} name="mission.partnerId" render={({ field }) => (<FormItem><FormLabel>External Partner</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger></FormControl><SelectContent>{partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    ) : (
                        <FormField control={form.control} name="mission.chauffeurId" render={({ field }) => (<FormItem><FormLabel>Chauffeur</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select chauffeur" /></SelectTrigger></FormControl><SelectContent>{chauffeurs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    )}
                     <FormField control={form.control} name="mission.projectId" render={({ field }) => (<FormItem><FormLabel>Project (Optional)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger></FormControl><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                </div>

                {/* Passengers */}
                <FormField
                  control={form.control}
                    name="mission.passengerIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Passengers</FormLabel>
                            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                              {users.map((user) => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`mission-passenger-${user.id}`}
                                          checked={field.value?.includes(user.id)}
                                            onCheckedChange={(checked) => {
                                                const currentValues = field.value || [];
                                                field.onChange(
                                                  checked
                                                      ? [...currentValues, user.id]
                                                      : currentValues.filter(id => id !== user.id)
                                                );
                                            }}
                                        />
                                        <label
                                          htmlFor={`mission-passenger-${user.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {user.name}
                                        </label>
                                    </div>
                                ))}
                                 {users.length === 0 && <p className="text-sm text-muted-foreground col-span-2">No users available to select.</p>}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Dates & Duration */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="mission.startDate" render={({ field }) => <DatePicker label="Start Date" value={field.value} onChange={field.onChange} />} />
                    <FormField control={form.control} name="mission.endDate" render={({ field }) => <DatePicker label="End Date" value={field.value} onChange={field.onChange} />} />
                </div>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                     <FormField control={form.control} name="mission.duration" render={({ field }) => (<FormItem><FormLabel>Duration (Hours)</FormLabel><FormControl><Input type="number" min="1" step="0.5" placeholder={`${DEFAULT_DURATION}`} {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="mission.totalBudget" render={({ field }) => (<FormItem><FormLabel>Total Budget (Optional)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                 </div>


                {/* Partner Fee */}
                {isExternalPartner && (
                    <FormField control={form.control} name="mission.partnerFee" render={({ field }) => (<FormItem><FormLabel>Partner Fee (Optional)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                )}

                 <FormField control={form.control} name="mission.notes" render={({ field }) => (<FormItem><FormLabel>Mission Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Notes about the overall mission..." {...field} /></FormControl><FormMessage /></FormItem>)} />


                {/* Rides within Mission */}
                 <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Rides in this Mission</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendRide({ pickupAddress: "", dropoffAddress: "", pickupTime: new Date(), category: "CITY_TRANSFER", status: "SCHEDULED", milestones: [] })} >
                            <PlusIcon className="mr-1 h-4 w-4" /> Add Ride
                        </Button>
                    </div>
                     {missionRideFields.length === 0 ? (
                        <div className="text-center p-4 border border-dashed rounded-md">
                            <p className="text-sm text-muted-foreground">No rides added yet. Click "Add Ride".</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                          {missionRideFields.map((item, index) => (
                                <Card key={item.id} className="relative bg-muted/50">
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-muted-foreground hover:text-destructive" onClick={() => removeRide(index)}>
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
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select ride type" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                              {MISSION_RIDE_CATEGORIES.map(cat => (
                                                                    <SelectItem key={cat} value={cat}>{getMissionRideCategoryLabel(cat)}</SelectItem>
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
                                                render={({ field }) => <DateTimePicker label="Pickup Time" value={field.value} onChange={field.onChange} />}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                                             <FormField control={form.control} name={`mission.rides.${index}.pickupAddress`} render={({ field }) => (<FormItem><FormLabel>Pickup Address</FormLabel><FormControl><Input placeholder="Pickup Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                             <FormField control={form.control} name={`mission.rides.${index}.dropoffAddress`} render={({ field }) => (<FormItem><FormLabel>Dropoff Address</FormLabel><FormControl><Input placeholder="Dropoff Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                          {/* Consider adding notes/fare per mission ride if needed */}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}


const ReviewStep: React.FC<StepProps & { isMission: boolean }> = ({ form, users = [], chauffeurs = [], clients = [], partners = [], isMission }) => {
    const values = form.getValues();
    const passenger = values.useExistingPassenger ? users.find(u => u.id === values.passengerId) : values.passengerInfo;
    const client = clients.find(c => c.id === values.mission?.clientId);
    const partner = partners.find(p => p.id === values.mission?.partnerId);
    const chauffeur = chauffeurs.find(c => c.id === values.mission?.chauffeurId);

     return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Details</h3>
            <Card>
                 <CardContent className="pt-6 space-y-3">
                     <h4 className="font-semibold">Passenger</h4>
                     {passenger ? (
                         <>
                             <p><span className="font-medium">Name:</span> {values.useExistingPassenger ? (passenger as User)?.name : `${(passenger as z.infer<typeof passengerSchema>)?.firstName} ${(passenger as z.infer<typeof passengerSchema>)?.lastName}`}</p>
                             {!values.useExistingPassenger && <p><span className="font-medium">Phone:</span> {(passenger as z.infer<typeof passengerSchema>)?.phoneNumber || 'N/A'}</p>}
                             {!values.useExistingPassenger && <p><span className="font-medium">Count:</span> {(passenger as z.infer<typeof passengerSchema>)?.passengerCount}</p>}
                         </>
                     ) : <p className="text-muted-foreground">No passenger selected/entered.</p>}
                 </CardContent>
             </Card>

            {!isMission ? (
                 <Card>
                     <CardContent className="pt-6 space-y-3">
                         <h4 className="font-semibold">Ride Details</h4>
                         <p><span className="font-medium">Type:</span> {getRideCategoryLabel(values.category)}</p>
                         <p><span className="font-medium">Pickup:</span> {values.pickupAddress}</p>
                         <p><span className="font-medium">Dropoff:</span> {values.dropoffAddress}</p>
                         <p><span className="font-medium">Time:</span> {format(values.pickupTime, "PPP HH:mm")}</p>
                         <p><span className="font-medium">Status:</span> {values.status}</p>
                         {values.fare && <p><span className="font-medium">Fare:</span> ${values.fare.toFixed(2)}</p>}
                         {values.notes && <p><span className="font-medium">Notes:</span> {values.notes}</p>}
                         {values.milestones && values.milestones.length > 0 && (
                            <div>
                                <h5 className="font-medium mt-2">Milestones:</h5>
                                <ul className="list-disc pl-5 text-sm">
                                    {values.milestones.map((m, i) => <li key={i}>{m.type}: {m.address} {m.time ? `(${format(m.time, "HH:mm")})` : ''}</li>)}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                 </Card>
            ) : (
                 <Card>
                     <CardContent className="pt-6 space-y-3">
                        <h4 className="font-semibold">Mission Details</h4>
                         <p><span className="font-medium">Title:</span> {values.mission?.title}</p>
                         <p><span className="font-medium">Client:</span> {client?.name || 'N/A'}</p>
                         {values.mission?.isExternalPartner ? (
                            <p><span className="font-medium">Partner:</span> {partner?.name || 'N/A'}</p>
                         ) : (
                            <p><span className="font-medium">Chauffeur:</span> {chauffeur?.name || 'N/A'}</p>
                         )}
                         <p><span className="font-medium">Dates:</span> {values.mission?.startDate ? format(values.mission.startDate, "PPP") : 'N/A'} - {values.mission?.endDate ? format(values.mission.endDate, "PPP") : 'N/A'}</p>
                         <p><span className="font-medium">Duration:</span> {values.mission?.duration} hours</p>
                        {values.mission?.totalBudget && <p><span className="font-medium">Budget:</span> ${values.mission.totalBudget.toFixed(2)}</p>}
                         {values.mission?.isExternalPartner && values.mission?.partnerFee && <p><span className="font-medium">Partner Fee:</span> ${values.mission.partnerFee.toFixed(2)}</p>}

                         {values.mission?.rides && values.mission.rides.length > 0 && (
                            <div>
                                <h5 className="font-medium mt-2">Rides:</h5>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                     {values.mission.rides.map((r, i) => (
                                        <li key={r.id || i}>
                                            {getMissionRideCategoryLabel(r.category)} from {r.pickupAddress} to {r.dropoffAddress} at {format(r.pickupTime, "PP HH:mm")}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                         {values.mission?.notes && <p><span className="font-medium mt-2 block">Mission Notes:</span> {values.mission.notes}</p>}
                     </CardContent>
                 </Card>
            )}
        </div>
    );
}


// --- Main Form Component ---

export function RideForm({
  onAddRide,
  users = [],
  chauffeurs = [],
  clients = [],
  partners = [],
  projects = [],
  existingMissions = [],
  defaultValues: initialDefaultValues, // Renamed to avoid conflict
  buttonText = "Add Ride",
  showMissionButton = true, // Keep this prop if explicitly needed outside mission context
}: RideFormProps) {

  const form = useForm({
    resolver: zodResolver(rideFormSchema),
    defaultValues: getDefaultRideValues(initialDefaultValues),
    mode: 'onChange', // Validate on change for better UX
  });

  const { control, handleSubmit, watch, setValue, getValues, reset, trigger } = form;

  const isMission = watch("isMission");
  const useExistingPassenger = watch("useExistingPassenger");
  const selectedPassengerId = watch("passengerId"); // Used only for mission creation logic now
  const selectedChauffeurIdForMissionCreation = watch("mission.chauffeurId"); // Watch specific field if needed

  // --- Multi-Step Logic ---
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo(() => [
    { id: "passenger", label: "Passenger", fields: ['passengerId', 'passengerInfo', 'useExistingPassenger'] as Path<RideFormValues>[] },
    { id: "ride-details", label: "Ride Details", fields: ['pickupAddress', 'dropoffAddress', 'pickupTime', 'category', 'status', 'fare', 'notes'] as Path<RideFormValues>[] },
    ...(!isMission ? [{ id: "milestones", label: "Milestones", fields: ['milestones'] as Path<RideFormValues>[] }] : []), // Conditional step for milestones
    ...(isMission ? [{ id: "mission", label: "Mission", fields: ['mission'] as Path<RideFormValues>[] }] : []), // Conditional step for mission
    { id: "review", label: "Review", fields: [] as Path<RideFormValues>[] }, // No validation needed for review
  ], [isMission]); // Recalculate steps when isMission changes

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const validateStep = useCallback(async (stepIndex: number): Promise<boolean> => {
    const step = steps[stepIndex];
    if (!step || !step.fields || step.fields.length === 0) {
        return true; // No fields to validate for this step
    }
    console.log("Validating fields for step:", step.id, step.fields);
    const result = await trigger(step.fields);
    console.log("Validation result:", result);
    return result;
  }, [trigger, steps]);

  const handleNext = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      nextStep();
    } else {
        console.log("Step validation failed", form.formState.errors);
        // Optionally: scroll to the first error
    }
  }, [currentStep, validateStep, nextStep, form.formState.errors]);


  // --- Mission Handling ---

  const chauffeurHasExistingMission = useCallback((chauffeurId: string): boolean => {
    return existingMissions.some(mission => mission.chauffeurId === chauffeurId);
  }, [existingMissions]);

  const createNewMissionForChauffeur = useCallback(() => {
    const passenger = users.find(user => user.id === selectedPassengerId);
    const missionTitle = passenger ? `Mission for ${passenger.name}` : "New Mission";
    const currentMissionValues = getValues("mission") || {};
    const chauffeurId = getValues("mission.chauffeurId"); // Use the ID from mission section

    setValue("isMission", true, { shouldValidate: true });
    setValue("mission", {
      ...getDefaultMissionValues(),
      ...currentMissionValues,
      chauffeurId: chauffeurId || undefined,
      title: missionTitle,
      status: "SCHEDULED" as const,
      clientId: selectedPassengerId || "", // Use selectedPassengerId directly instead of currentMissionValues
      passengerIds: selectedPassengerId ? [selectedPassengerId] : [],
      isExternalPartner: false,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      duration: DEFAULT_DURATION,
      rides: [], // Initialize empty rides array
      notes: "",
      totalBudget: undefined,
      partnerFee: undefined,
      partnerId: undefined,
      projectId: undefined
    }, { shouldValidate: true });

    // Optionally move to mission step if not already there or review step?
    // Find mission step index
     const missionStepIndex = steps.findIndex(step => step.id === 'mission');
     if (missionStepIndex !== -1 && currentStep < missionStepIndex) {
         setCurrentStep(missionStepIndex);
     }

  }, [setValue, getValues, selectedPassengerId, users, steps, currentStep]);


  // --- Form Submission ---
  const processAndSubmit = useCallback((data: RideFormValues) => {
    console.log("Form data submitted:", data);

    let finalData = { ...data };

    // Logic to auto-create mission IF:
    // - It's *not* currently set as a mission
    // - A chauffeur *is* selected within the mission details section (even if hidden)
    // - That chauffeur doesn't already have an overlapping mission (using existingMissions check)
    const potentialChauffeurId = data.mission?.chauffeurId;
    if (!finalData.isMission && potentialChauffeurId && !chauffeurHasExistingMission(potentialChauffeurId)) {
      console.log("Auto-creating mission for chauffeur:", potentialChauffeurId);

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const chauffeur = chauffeurs.find(c => c.id === potentialChauffeurId);
      const chauffeurName = chauffeur ? chauffeur.name : 'Selected Chauffeur';

      const passenger = finalData.useExistingPassenger
        ? users.find(u => u.id === finalData.passengerId)
        : finalData.passengerInfo;
      const passengerName = finalData.useExistingPassenger
        ? (passenger as User)?.name || 'Selected Passenger'
        : `${(passenger as z.infer<typeof passengerSchema>)?.firstName} ${(passenger as z.infer<typeof passengerSchema>)?.lastName}` || 'New Passenger';

      finalData.isMission = true;
      finalData.mission = {
        ...getDefaultMissionValues(),
        title: `Mission for ${passengerName} with ${chauffeurName}`,
        status: "SCHEDULED" as const,
        clientId: finalData.passengerId || clients[0]?.id || "",
        chauffeurId: potentialChauffeurId,
        passengerIds: finalData.passengerId ? [finalData.passengerId] : [],
        startDate: today,
        endDate: tomorrow,
        duration: DEFAULT_DURATION,
        isExternalPartner: false,
        rides: [{
          pickupAddress: finalData.pickupAddress,
          dropoffAddress: finalData.dropoffAddress,
          pickupTime: finalData.pickupTime,
          category: MISSION_RIDE_CATEGORIES.includes(finalData.category as any) ? finalData.category as typeof MISSION_RIDE_CATEGORIES[number] : 'CITY_TRANSFER',
          status: "SCHEDULED",
          milestones: finalData.milestones,
          notes: finalData.notes,
          fare: finalData.fare,
        }],
        notes: "",
        totalBudget: undefined,
        partnerFee: undefined,
        partnerId: undefined,
        projectId: undefined
      };

       // Clear non-mission fields after incorporating them into the mission ride
       finalData.pickupAddress = "";
       finalData.dropoffAddress = "";
       // finalData.pickupTime = new Date(); // Or keep?
       finalData.category = "CITY_TRANSFER"; // Reset category?
       finalData.status = "SCHEDULED";
       finalData.notes = "";
       finalData.fare = undefined;
       finalData.milestones = [];
    }

    onAddRide(finalData);
    reset(getDefaultRideValues(initialDefaultValues)); // Reset with initial defaults
    setCurrentStep(0); // Reset to first step
  }, [onAddRide, reset, chauffeurs, users, clients, initialDefaultValues, chauffeurHasExistingMission]);


  // --- Render Logic ---

  const renderStepContent = () => {
    const stepId = steps[currentStep]?.id;
    const stepProps = { form, users, chauffeurs, clients, partners, projects };

    switch (stepId) {
      case 'passenger':
        return <PassengerStep {...stepProps as StepProps} />;
      case 'ride-details':
        return <RideDetailsStep {...stepProps as StepProps} isMission={!!isMission} />;
      case 'milestones':
        return !isMission ? <MilestonesStep {...stepProps as StepProps} /> : null;
      case 'mission':
        return isMission ? <MissionStep {...stepProps as StepProps} /> : null;
      case 'review':
         return <ReviewStep {...stepProps as StepProps} isMission={!!isMission} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit((data) => processAndSubmit(data as unknown as RideFormValues))} className="space-y-6">
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
            <div className="min-h-[400px]">{renderStepContent()}</div>

             {/* Conditionally show "Create Mission" button only in Passenger or Ride Details step if conditions met */}
             {(currentStep === 0 || currentStep === 1) && showMissionButton && !isMission && getValues("mission.chauffeurId") && (
                <div className="flex justify-end pt-2">
                    <Button type="button" variant="outline" onClick={createNewMissionForChauffeur} >
                        Create Mission for Chauffeur
                    </Button>
                </div>
            )}


            {/* Mission Toggle (Show always? Maybe hide in review step?) */}
             {currentStep !== steps.length - 1 && (
                 <FormField
                    control={control}
                    name="isMission"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Mission Mode</FormLabel>
                                <FormDescription>Enable for multi-day/multi-ride assignments.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            )}


            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
                {currentStep > 0 ? (
                    <Button type="button" variant="outline" onClick={prevStep}>
                        <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
                    </Button>
                ) : (
                    <div /> // Placeholder to keep Next/Submit button on the right
                )}

                {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext}>
                        Next <ChevronRightIcon className="ml-2 h-4 w-4" />
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
















