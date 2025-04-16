"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { chauffeurFormSchema, ChauffeurFormValues, Chauffeur, User, Vehicle, ChauffeurCategory } from "./types";

interface ChauffeurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ChauffeurFormValues) => void;
  defaultValues?: Chauffeur;
}

export function ChauffeurDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: ChauffeurDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<ChauffeurFormValues>({
    resolver: zodResolver(chauffeurFormSchema),
    defaultValues: defaultValues
      ? {
          userId: defaultValues.userId,
          licenseNumber: defaultValues.licenseNumber,
          licenseExpiry: new Date(defaultValues.licenseExpiry),
          vtcCardNumber: defaultValues.vtcCardNumber,
          vtcValidationDate: new Date(defaultValues.vtcValidationDate),
          vehicleId: defaultValues.vehicle?.id || null,
          status: defaultValues.status,
          category: defaultValues.category,
          notes: defaultValues.notes || "",
        }
      : {
          userId: "",
          licenseNumber: "",
          licenseExpiry: new Date(),
          vtcCardNumber: "",
          vtcValidationDate: new Date(),
          vehicleId: null,
          status: "AVAILABLE",
          category: "AVERAGE",
          notes: "",
        },
  });

  // Fetch users and vehicles when the dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchVehicles();
    }
  }, [open]);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      console.log('Fetching users...');

      // Use a simpler fetch without credentials
      const response = await fetch("/api/users");

      console.log('Users API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Users data received:', data);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);

      // Fallback to mock data if API fails
      console.log('Using fallback mock user data');
      setUsers([
        {
          id: "user_1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
        },
        {
          id: "user_2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
        },
        {
          id: "user_3",
          firstName: "Michael",
          lastName: "Johnson",
          email: "michael.johnson@example.com",
        },
      ]);

      toast.error("Using mock user data due to API error");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch vehicles from the API
  const fetchVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      console.log('Fetching vehicles...');

      // Use a simpler fetch without credentials
      const response = await fetch("/api/vehicles");

      console.log('Vehicles API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`Failed to fetch vehicles: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Vehicles data received:', data);
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);

      // Fallback to mock data if API fails
      console.log('Using fallback mock vehicle data');
      setVehicles([
        {
          id: "vehicle_1",
          make: "Mercedes",
          model: "S-Class",
          licensePlate: "ABC123",
        },
        {
          id: "vehicle_2",
          make: "BMW",
          model: "7 Series",
          licensePlate: "XYZ789",
        },
        {
          id: "vehicle_3",
          make: "Audi",
          model: "A8",
          licensePlate: "DEF456",
        },
      ]);

      toast.error("Using mock vehicle data due to API error");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (data: ChauffeurFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save chauffeur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto md:max-w-[600px] lg:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Chauffeur" : "Create Chauffeur"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues
              ? "Update the chauffeur's information"
              : "Create a new chauffeur profile"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* User Selection */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>User</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={!!defaultValues}
                        >
                          {isLoadingUsers ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : field.value ? (
                            users.find((user) => user.id === field.value)
                              ? `${
                                  users.find((user) => user.id === field.value)
                                    ?.firstName
                                } ${
                                  users.find((user) => user.id === field.value)
                                    ?.lastName
                                }`
                              : "Select user"
                          ) : (
                            "Select user"
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[calc(100vw-2rem)] md:w-full p-0" sideOffset={4}>
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.id}
                              onSelect={() => {
                                form.setValue("userId", user.id);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  user.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {user.firstName} {user.lastName} ({user.email})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the user to assign as a chauffeur.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* License and VTC Information - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* License Number */}
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter license number" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      The chauffeur's driving license number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* License Expiry */}
              <FormField
                control={form.control}
                name="licenseExpiry"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>License Expiry Date</FormLabel>
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
                      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      The expiration date of the chauffeur's license.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* VTC Card Number */}
              <FormField
                control={form.control}
                name="vtcCardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VTC Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter VTC card number" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      The chauffeur's VTC professional card number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* VTC Validation Date */}
              <FormField
                control={form.control}
                name="vtcValidationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>VTC Validation Date</FormLabel>
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
                      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      The validation date of the chauffeur's VTC card.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Vehicle Selection */}
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Vehicle (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isLoadingVehicles ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : field.value ? (
                            vehicles.find(
                              (vehicle) => vehicle.id === field.value
                            )
                              ? `${
                                  vehicles.find(
                                    (vehicle) => vehicle.id === field.value
                                  )?.make
                                } ${
                                  vehicles.find(
                                    (vehicle) => vehicle.id === field.value
                                  )?.model
                                } (${
                                  vehicles.find(
                                    (vehicle) => vehicle.id === field.value
                                  )?.licensePlate
                                })`
                              : "Select vehicle"
                          ) : (
                            "Select vehicle (optional)"
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[calc(100vw-2rem)] md:w-full p-0" sideOffset={4}>
                      <Command>
                        <CommandInput placeholder="Search vehicles..." />
                        <CommandEmpty>No vehicles found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              form.setValue("vehicleId", null);
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === null ? "opacity-100" : "opacity-0"
                              )}
                            />
                            No vehicle
                          </CommandItem>
                          {vehicles.map((vehicle) => (
                            <CommandItem
                              key={vehicle.id}
                              value={vehicle.id}
                              onSelect={() => {
                                form.setValue("vehicleId", vehicle.id);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  vehicle.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Assign a vehicle to this chauffeur (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status and Category - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
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
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="BUSY">Busy</SelectItem>
                        <SelectItem value="ON_BREAK">On Break</SelectItem>
                        <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      The current status of the chauffeur.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH_END">High End</SelectItem>
                        <SelectItem value="BUSINESS">Business</SelectItem>
                        <SelectItem value="ECONOMY">Economy</SelectItem>
                        <SelectItem value="AVERAGE">Average</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      The category of service the chauffeur provides.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes about the chauffeur"
                      className="resize-none min-h-[80px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Additional notes about the chauffeur.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mt-3 sm:mt-0 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : defaultValues ? (
                  "Update Chauffeur"
                ) : (
                  "Create Chauffeur"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
