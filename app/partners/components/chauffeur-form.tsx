"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { chauffeurFormSchema, type ChauffeurFormValues } from "../schemas/chauffeur-schema";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChauffeurFormProps {
  defaultValues?: Partial<ChauffeurFormValues>;
  onSubmit: (data: ChauffeurFormValues) => void;
  isSubmitting?: boolean;
  buttonText?: string;
  partnerId: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
}

export function ChauffeurForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  buttonText = "Submit",
  partnerId,
}: ChauffeurFormProps) {
  const [isExternalChauffeur, setIsExternalChauffeur] = useState(defaultValues?.isExternalChauffeur || false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const form = useForm<ChauffeurFormValues>({
    resolver: zodResolver(chauffeurFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      licenseNumber: "",
      licenseExpiry: new Date().toISOString().split('T')[0],
      isExternalChauffeur: false,
      nextIsChauffeurId: "",
      notes: "",
      status: "AVAILABLE",
      ...defaultValues,
    },
  });

  // Watch for changes to the isExternalChauffeur field
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "isExternalChauffeur") {
        setIsExternalChauffeur(value.isExternalChauffeur || false);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Fetch partner vehicles
  const fetchPartnerVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const response = await fetch(`/api/partners/${partnerId}/vehicles`);
      if (!response.ok) {
        throw new Error("Failed to fetch partner vehicles");
      }

      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching partner vehicles:", error);
      toast.error("Failed to load partner vehicles");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchPartnerVehicles();
    }
  }, [partnerId]);

  const handleSubmit = (data: ChauffeurFormValues) => {
    // Check if all required fields are present
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'licenseNumber', 'licenseExpiry'];
    const missingFields = requiredFields.filter(field => !data[field as keyof ChauffeurFormValues]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Log the data being submitted
    console.log('Submitting chauffeur data:', data);
    
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* External Chauffeur Toggle */}
        <div className="mb-6">
          <FormField
            control={form.control}
            name="isExternalChauffeur"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">External Chauffeur</FormLabel>
                  <FormDescription>
                    Toggle ON if this is an external chauffeur not directly employed by your company.
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

        {/* NextIS Chauffeur ID (only shown if isExternalChauffeur is true) */}
        {isExternalChauffeur && (
          <FormField
            control={form.control}
            name="nextIsChauffeurId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>NextIS Chauffeur ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter NextIS chauffeur ID"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the NextIS ID for this external chauffeur if available.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* License Number */}
          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Number*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter license number" {...field} />
                </FormControl>
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
                <FormLabel>License Expiry Date*</FormLabel>
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
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString().split('T')[0] : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vehicle */}
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Vehicle</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {isLoadingVehicles ? (
                      <SelectItem value="" disabled>
                        Loading vehicles...
                      </SelectItem>
                    ) : vehicles.length === 0 ? (
                      <SelectItem value="" disabled>
                        No vehicles available
                      </SelectItem>
                    ) : (
                      vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional notes about this chauffeur"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
