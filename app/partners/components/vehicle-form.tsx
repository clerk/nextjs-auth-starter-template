"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleFormSchema, type VehicleFormValues } from "../schemas/vehicle-schema";
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
import { AlertCircle, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDebounce } from "@/lib/hooks/use-debounce";

// Interface for the vehicle API response
interface VehicleApiResponse {
  info: {
    immatriculation: string;
    marque: string;
    modele: string;
    dateMiseEnCirculation: string;
    energy: string;
  };
  data: {
    date1erCir_fr: string;
  };
}

interface VehicleFormProps {
  defaultValues?: Partial<VehicleFormValues>;
  onSubmit: (data: VehicleFormValues) => void;
  isSubmitting?: boolean;
  buttonText?: string;
  partnerId: string;
}

export function VehicleForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  buttonText = "Save Vehicle",
  partnerId,
}: VehicleFormProps) {
  const [isFetchingPlate, setIsFetchingPlate] = useState(false);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [plateSuccess, setPlateSuccess] = useState<string | null>(null);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      isForeignPlate: false,
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear().toString(),
      color: "",
      capacity: "4",
      vehicleType: "SEDAN",
      status: "AVAILABLE",
      ...defaultValues,
    },
  });

  // Watch for changes to the license plate and isForeignPlate fields
  const licensePlate = useWatch({
    control: form.control,
    name: "licensePlate",
  });

  const isForeignPlate = useWatch({
    control: form.control,
    name: "isForeignPlate",
  });

  const debouncedLicensePlate = useDebounce(licensePlate, 500);

  // Check if a license plate matches the French format (XX-111-XX or XX111XX)
  const isFrenchPlateFormat = (plate: string) => {
    // Remove spaces and dashes for the check
    const cleanPlate = plate.replace(/[\s-]/g, "");

    // French plate format: 2 letters + 3 digits + 2 letters (e.g., AB123CD)
    const frenchPlateRegex = /^[A-Za-z]{2}\d{3}[A-Za-z]{2}$/;

    return frenchPlateRegex.test(cleanPlate);
  };

  // Fetch vehicle data when license plate changes and it's a French plate
  useEffect(() => {
    // Clear any previous success/error messages when the foreign plate toggle changes
    if (isForeignPlate) {
      setPlateSuccess(null);
      setPlateError(null);
      // Clear auto-populated fields if switching to foreign plate
      if (form.getValues("brand") && !form.formState.dirtyFields.brand) {
        form.setValue("brand", "");
      }
      if (form.getValues("model") && !form.formState.dirtyFields.model) {
        form.setValue("model", "");
      }
      if (form.getValues("year") && !form.formState.dirtyFields.year) {
        form.setValue("year", new Date().getFullYear().toString());
      }
      // Clear API-specific fields
      form.setValue("fuelType", "");
      form.setValue("registrationDate", "");
      return;
    }

    // Only proceed if the license plate matches the French format
    if (!debouncedLicensePlate || !isFrenchPlateFormat(debouncedLicensePlate)) {
      setPlateSuccess(null);
      setPlateError(null);
      return;
    }

    const fetchVehicleData = async () => {
      setIsFetchingPlate(true);
      setPlateError(null);
      setPlateSuccess(null);

      try {
        // Format the license plate by removing spaces and dashes
        const formattedPlate = debouncedLicensePlate.replace(/[\s-]/g, "");

        const response = await fetch(
          `https://api-immat.vercel.app/getDataImmatriculation?plaque=${formattedPlate}&region=`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch vehicle data");
        }

        const data: VehicleApiResponse = await response.json();

        if (data.info && data.info.marque) {
          // Update form fields with the fetched data
          form.setValue("brand", data.info.marque);
          form.setValue("model", data.info.modele);

          // Extract year from dateMiseEnCirculation (format: YYYY-MM-DD)
          const year = data.info.dateMiseEnCirculation.split("-")[0];
          form.setValue("year", year);

          // Store additional data from the API
          form.setValue("fuelType", data.info.energy);
          form.setValue("registrationDate", data.info.dateMiseEnCirculation);

          setPlateSuccess(`Vehicle data found: ${data.info.marque} ${data.info.modele} (${year})`);
        } else {
          setPlateError("No vehicle data found for this license plate");
        }
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        setPlateError("Failed to fetch vehicle data");
      } finally {
        setIsFetchingPlate(false);
      }
    };

    fetchVehicleData();
  }, [debouncedLicensePlate, isForeignPlate, form]);

  // Function to manually fetch vehicle data
  const handleFetchVehicleData = async () => {
    const licensePlate = form.getValues("licensePlate");

    if (!licensePlate || !isFrenchPlateFormat(licensePlate)) {
      toast.error("Please enter a valid French license plate (format: XX-111-XX)");
      return;
    }

    setIsFetchingPlate(true);
    setPlateError(null);
    setPlateSuccess(null);

    try {
      // Format the license plate by removing spaces and dashes
      const formattedPlate = licensePlate.replace(/[\s-]/g, "");

      const response = await fetch(
        `https://api-immat.vercel.app/getDataImmatriculation?plaque=${formattedPlate}&region=`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch vehicle data");
      }

      const data: VehicleApiResponse = await response.json();

      if (data.info && data.info.marque) {
        // Update form fields with the fetched data
        form.setValue("brand", data.info.marque);
        form.setValue("model", data.info.modele);

        // Extract year from dateMiseEnCirculation (format: YYYY-MM-DD)
        const year = data.info.dateMiseEnCirculation.split("-")[0];
        form.setValue("year", year);

        // Store additional data from the API
        form.setValue("fuelType", data.info.energy);
        form.setValue("registrationDate", data.info.dateMiseEnCirculation);

        setPlateSuccess(`Vehicle data found: ${data.info.marque} ${data.info.modele} (${year})`);
        toast.success("Vehicle data fetched successfully");
      } else {
        setPlateError("No vehicle data found for this license plate");
        toast.error("No vehicle data found for this license plate");
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      setPlateError("Failed to fetch vehicle data");
      toast.error("Failed to fetch vehicle data");
    } finally {
      setIsFetchingPlate(false);
    }
  };

  const handleSubmit = (data: VehicleFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* French Plate Toggle */}
        <div className="mb-6">
          <FormField
            control={form.control}
            name="isForeignPlate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Non-French License Plate</FormLabel>
                  <FormDescription>
                    Toggle ON if this vehicle has a non-French license plate. Toggle OFF for French plates to auto-fetch vehicle data.
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* License Plate - Always at the top */}
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>License Plate*</FormLabel>
                <div className="flex gap-2">
                  <FormControl className="flex-1">
                    <div className="relative">
                      <Input
                        placeholder="Enter license plate"
                        {...field}
                        className={cn(
                          isFetchingPlate && "pr-10",
                          plateError && "border-destructive",
                          plateSuccess && "border-green-500"
                        )}
                      />
                      {isFetchingPlate && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {!isFetchingPlate && plateSuccess && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Search className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {!isForeignPlate && (
                    <Button
                      type="button"
                      variant={isFrenchPlateFormat(form.getValues("licensePlate") || "") ? "default" : "secondary"}
                      onClick={handleFetchVehicleData}
                      disabled={isFetchingPlate}
                      className={isFrenchPlateFormat(form.getValues("licensePlate") || "") ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {isFetchingPlate ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      {isFrenchPlateFormat(form.getValues("licensePlate") || "") ? "Get Vehicle Data" : "Fetch Data"}
                    </Button>
                  )}
                </div>
                {plateError && (
                  <div className="text-sm font-medium text-destructive mt-1">{plateError}</div>
                )}
                {plateSuccess && (
                  <div className="text-sm font-medium text-green-500 mt-1">{plateSuccess}</div>
                )}
                <FormDescription>
                  {!isForeignPlate && (
                    <>
                      For French plates (format: XX-111-XX), vehicle data will be automatically fetched when you enter a valid plate number.
                      {!isFrenchPlateFormat(form.getValues("licensePlate") || "") && (
                        <span className="block mt-1 text-amber-500">Current format doesn't match French plate pattern</span>
                      )}
                    </>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Brand - Required, auto-populated for French plates */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{!isForeignPlate ? "Brand* (Auto-populated)" : "Brand*"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={!isForeignPlate ? "Will be auto-populated" : "Enter vehicle brand"}
                    {...field}
                    disabled={!isForeignPlate}
                  />
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
                <FormLabel>{!isForeignPlate ? "Model* (Auto-populated)" : "Model*"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={!isForeignPlate ? "Will be auto-populated" : "Enter vehicle model"}
                    {...field}
                    disabled={!isForeignPlate}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{!isForeignPlate ? "Year* (Auto-populated)" : "Year*"}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={!isForeignPlate ? "Will be auto-populated" : "Enter year"}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    {...field}
                    disabled={!isForeignPlate}
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
                  <Input placeholder="Enter vehicle color" {...field} />
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
                <FormLabel>Capacity*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter capacity"
                    min={1}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                    <SelectItem value="IN_USE">In Use</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
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
