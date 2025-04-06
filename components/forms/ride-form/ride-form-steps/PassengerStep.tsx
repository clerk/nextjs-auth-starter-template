// src/components/ride-form-steps/PassengerStep.tsx

"use client";

import React from 'react';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Import our new PassengerSearch component
import { PassengerSearch } from "../form-helpers/PassengerSearch";
import type { StepProps } from '../types';
import { DEFAULT_PASSENGER_COUNT } from '../constants'; //
export const PassengerStep: React.FC<StepProps> = ({ form, users = [] }) => {
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
                            <FormLabel>Search Passenger</FormLabel>
                            <FormControl>
                                <PassengerSearch
                                    users={users}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
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
                                        {...field}
                                        onChange={e => field.onChange(e.target.value === "" ? DEFAULT_PASSENGER_COUNT : parseInt(e.target.value))}
                                        value={field.value ?? DEFAULT_PASSENGER_COUNT}
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
};
