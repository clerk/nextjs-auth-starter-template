"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookingSchema, BookingFormValues, BookingStatusEnum } from "@/lib/validations/booking";
import { RideForm } from "./ride-form";

interface BookingFormProps {
  onSubmit: (data: BookingFormValues) => void;
  defaultValues?: Partial<BookingFormValues>;
  users?: { id: string; name: string }[];
  organizations?: { id: string; name: string }[];
}

export function BookingForm({
  onSubmit,
  defaultValues,
  users = [],
  organizations = [],
}: BookingFormProps) {
  const [rides, setRides] = useState<any[]>(defaultValues?.rides || []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerId: defaultValues?.customerId || "",
      organizationId: defaultValues?.organizationId || "",
      status: defaultValues?.status || "PENDING",
      totalAmount: defaultValues?.totalAmount || undefined,
      notes: defaultValues?.notes || "",
      rides: rides,
    },
  });

  const handleAddRide = (rideData: any) => {
    const updatedRides = [...rides, rideData];
    setRides(updatedRides);
    form.setValue("rides", updatedRides);
  };

  const handleRemoveRide = (index: number) => {
    const updatedRides = rides.filter((_, i) => i !== index);
    setRides(updatedRides);
    form.setValue("rides", updatedRides);
  };

  const handleSubmit = (data: BookingFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
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
                <FormDescription>
                  Select the customer for this booking
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the organization for this booking (optional)
                </FormDescription>
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
                    {Object.values(BookingStatusEnum.enum).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the status of this booking
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                    value={field.value === undefined ? "" : field.value}
                  />
                </FormControl>
                <FormDescription>
                  Enter the total amount for this booking
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
                  placeholder="Enter any additional notes about this booking"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add any additional information about this booking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Rides</h3>
            <RideForm onAddRide={handleAddRide} users={users} />
          </div>

          {rides.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No rides added yet. Click "Add Ride" to add a ride to this booking.
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ride {index + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRide(index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Pickup:</span>{" "}
                        {ride.pickupAddress}
                      </div>
                      <div>
                        <span className="font-medium">Dropoff:</span>{" "}
                        {ride.dropoffAddress}
                      </div>
                      <div>
                        <span className="font-medium">Pickup Time:</span>{" "}
                        {ride.pickupTime.toLocaleString()}
                      </div>
                      {ride.dropoffTime && (
                        <div>
                          <span className="font-medium">Dropoff Time:</span>{" "}
                          {ride.dropoffTime.toLocaleString()}
                        </div>
                      )}
                      {ride.notes && (
                        <div className="col-span-2">
                          <span className="font-medium">Notes:</span> {ride.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full md:w-auto">
          {defaultValues ? "Update Booking" : "Create Booking"}
        </Button>
      </form>
    </Form>
  );
}
