// src/components/ride-form-steps/MilestonesStep.tsx

"use client";

import React from 'react';
import { useFieldArray } from "react-hook-form";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { StepProps } from '../types';
import { MILESTONE_TYPES } from '../constants';
import { getMilestoneTypeIcon } from '../types/rideFormUtils';

export const MilestonesStep: React.FC<StepProps> = ({ form }) => {
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
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
};
