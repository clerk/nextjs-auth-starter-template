// src/components/ride-form-steps/RideDetailsStep.tsx

"use client";

import React from 'react';
import {
    FormControl,
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
import { DateTimePicker } from '../form-helpers/DateTimePicker';
import type { StepProps } from '../types'; // Adjust path as needed
import { RIDE_CATEGORIES, RIDE_STATUSES } from '../constants'; // Adjust path as needed
import { getRideCategoryLabel } from '../types/rideFormUtils';

interface RideDetailsStepProps extends StepProps {
    isMission: boolean;
}

export const RideDetailsStep: React.FC<RideDetailsStepProps> = ({ form, isMission }) => {
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
};
