"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CheckIcon, ChevronsUpDown, Loader2 } from "lucide-react";

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

// Mock data for testing
const mockVehicles = [
  { id: "v1", name: "Mercedes-Benz S-Class (AB-123-CD)", type: "LUXURY" },
  { id: "v2", name: "BMW 7 Series (EF-456-GH)", type: "LUXURY" },
  { id: "v3", name: "Audi A8 (IJ-789-KL)", type: "LUXURY" },
  { id: "v4", name: "Mercedes-Benz V-Class (MN-012-OP)", type: "VAN" },
  { id: "v5", name: "Cadillac Escalade (QR-345-ST)", type: "SUV" },
];

const mockChauffeurs = [
  { id: "c1", name: "John Smith" },
  { id: "c2", name: "Emma Johnson" },
  { id: "c3", name: "Michael Brown" },
  { id: "c4", name: "Sarah Davis" },
  { id: "c5", name: "Robert Wilson" },
];

// Define the form schema
const assignmentSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  chauffeurId: z.string().min(1, "Please select a chauffeur"),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface EventVehicleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventName: string;
}

export function EventVehicleAssignmentDialog({
  open,
  onOpenChange,
  eventId,
  eventName,
}: EventVehicleAssignmentDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [chauffeurSearchTerm, setChauffeurSearchTerm] = useState("");
  const [openVehicleCombobox, setOpenVehicleCombobox] = useState(false);
  const [openChauffeurCombobox, setOpenChauffeurCombobox] = useState(false);

  // Initialize the form
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      vehicleId: "",
      chauffeurId: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      notes: "",
    },
  });

  // Filter vehicles based on search term
  const filteredVehicles = mockVehicles.filter((vehicle) =>
    vehicle.name.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
  );

  // Filter chauffeurs based on search term
  const filteredChauffeurs = mockChauffeurs.filter((chauffeur) =>
    chauffeur.name.toLowerCase().includes(chauffeurSearchTerm.toLowerCase())
  );

  // Handle form submission
  const onSubmit = async (data: AssignmentFormValues) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call an API here
      console.log("Assignment data:", {
        eventId,
        ...data,
      });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Vehicle assigned successfully to event");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error assigning vehicle:", error);
      toast.error("Failed to assign vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Vehicle to Event</DialogTitle>
          <DialogDescription>
            Assign a vehicle and chauffeur to {eventName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Vehicle</FormLabel>
                  <Popover open={openVehicleCombobox} onOpenChange={setOpenVehicleCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openVehicleCombobox}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? mockVehicles.find((vehicle) => vehicle.id === field.value)?.name
                            : "Select vehicle"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search vehicles..."
                          onValueChange={setVehicleSearchTerm}
                        />
                        <CommandEmpty>No vehicle found.</CommandEmpty>
                        <CommandGroup>
                          {filteredVehicles.map((vehicle) => (
                            <CommandItem
                              key={vehicle.id}
                              value={vehicle.id}
                              onSelect={() => {
                                form.setValue("vehicleId", vehicle.id);
                                setOpenVehicleCombobox(false);
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
                              {vehicle.name}
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({vehicle.type})
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the vehicle to assign to this event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chauffeurId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Chauffeur</FormLabel>
                  <Popover open={openChauffeurCombobox} onOpenChange={setOpenChauffeurCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openChauffeurCombobox}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? mockChauffeurs.find((chauffeur) => chauffeur.id === field.value)?.name
                            : "Select chauffeur"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search chauffeurs..."
                          onValueChange={setChauffeurSearchTerm}
                        />
                        <CommandEmpty>No chauffeur found.</CommandEmpty>
                        <CommandGroup>
                          {filteredChauffeurs.map((chauffeur) => (
                            <CommandItem
                              key={chauffeur.id}
                              value={chauffeur.id}
                              onSelect={() => {
                                form.setValue("chauffeurId", chauffeur.id);
                                setOpenChauffeurCombobox(false);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  chauffeur.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {chauffeur.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the chauffeur to assign to this vehicle.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
    </Dialog>
  );
}
