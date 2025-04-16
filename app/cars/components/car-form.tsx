"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { carSchema, CarFormValues } from "../schemas/car-schema";

interface CarFormProps {
  defaultValues?: Partial<CarFormValues>;
  onSubmit: (data: CarFormValues) => void;
  onCancel?: () => void;
}

export function CarForm({ defaultValues, onSubmit, onCancel }: CarFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPlate, setIsCheckingPlate] = useState(false);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: defaultValues?.make || "",
      model: defaultValues?.model || "",
      year: defaultValues?.year || new Date().getFullYear(),
      licensePlate: defaultValues?.licensePlate || "",
      color: defaultValues?.color || "",
      capacity: defaultValues?.capacity || 4,
      vehicleType: defaultValues?.vehicleType || "SEDAN",
      status: defaultValues?.status || "AVAILABLE",
      lastMaintenance: defaultValues?.lastMaintenance || null,
      isFrenchPlate: defaultValues?.isFrenchPlate !== false,
    },
  });

  const isFrenchPlate = form.watch("isFrenchPlate");
  const licensePlate = form.watch("licensePlate");

  // Function to check if a license plate is in the French format (XX-123-XX)
  const isFrenchPlateFormat = (plate: string) => {
    const regex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
    return regex.test(plate);
  };

  // Function to fetch vehicle data from the API
  const fetchVehicleData = async (plate: string) => {
    try {
      setIsCheckingPlate(true);
      const response = await fetch(`https://api-immat.vercel.app/getDataImmatriculation?plate=${plate}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle data");
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        // Update form with fetched data
        form.setValue("make", data.marque || "");
        form.setValue("model", data.modele || "");
        form.setValue("year", parseInt(data.date_mise_circulation?.split("/")[2] || new Date().getFullYear().toString()));
        
        toast.success("Vehicle information retrieved successfully");
      } else {
        toast.error("Could not find vehicle information");
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      toast.error("Failed to fetch vehicle data");
    } finally {
      setIsCheckingPlate(false);
    }
  };

  // Debounce function for license plate check
  useEffect(() => {
    if (isFrenchPlate && licensePlate && isFrenchPlateFormat(licensePlate)) {
      const timer = setTimeout(() => {
        fetchVehicleData(licensePlate);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [licensePlate, isFrenchPlate]);

  const handleSubmit = async (data: CarFormValues) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="isFrenchPlate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">French License Plate</FormLabel>
                  <FormDescription>
                    Is this a French vehicle?
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder={isFrenchPlate ? "XX-123-XX" : "License Plate"} 
                      {...field} 
                      disabled={isCheckingPlate}
                    />
                    {isCheckingPlate && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  {isFrenchPlate ? "Enter the license plate in format XX-123-XX" : "Enter the license plate"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SEDAN">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="VAN">Van</SelectItem>
                    <SelectItem value="LUXURY">Luxury</SelectItem>
                    <SelectItem value="LIMOUSINE">Limousine</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand *</FormLabel>
                <FormControl>
                  <Input placeholder="Brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model *</FormLabel>
                <FormControl>
                  <Input placeholder="Model" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Year" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Capacity" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="IN_USE">In Use</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastMaintenance"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Last Maintenance</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
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
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Vehicle"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
