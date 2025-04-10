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
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      licensePlate: "",
      isForeignPlate: false,
      color: "",
      capacity: "4",
      vehicleType: "SEDAN",
      status: "AVAILABLE",
      lastMaintenance: "",
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

  // Fetch vehicle data when license plate changes and it's a French plate
  useEffect(() => {
    if (!debouncedLicensePlate || isForeignPlate || debouncedLicensePlate.length < 5) {
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
          form.setValue("make", data.info.marque);
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

  const handleSubmit = (data: VehicleFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vehicle make" {...field} />
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
                <FormLabel>Model*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vehicle model" {...field} />
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
                <FormLabel>Year*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter year"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    {...field}
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
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate*</FormLabel>
                <FormControl>
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
                {plateError && (
                  <div className="text-sm font-medium text-destructive mt-1">{plateError}</div>
                )}
                {plateSuccess && (
                  <div className="text-sm font-medium text-green-500 mt-1">{plateSuccess}</div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isForeignPlate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Non-French License Plate</FormLabel>
                  <FormDescription>
                    Toggle if this vehicle has a non-French license plate
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
                        field.onChange(date ? date.toISOString() : "")
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
