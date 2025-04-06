"use client";

import React from 'react';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
    value?: Date;
    onChange: (date?: Date) => void;
    label: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, label }) => {
    const handleDateSelect = (selectedDate?: Date) => {
        if (selectedDate) {
            const currentDate = value || new Date();
            const newDate = new Date(selectedDate);
            newDate.setHours(currentDate.getHours());
            newDate.setMinutes(currentDate.getMinutes());
            onChange(newDate);
        } else {
            onChange(undefined); // Allow clearing the date
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const date = value || new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        onChange(new Date(date));
    };

    const timeValue = value ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}` : "";

    return (
        <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !value && "text-muted-foreground"
                            )}
                        >
                            {value ? format(value, "PPP HH:mm") : <span>Pick a date and time</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                    <div className="border-t p-3">
                        <Input
                            type="time"
                            onChange={handleTimeChange}
                            value={timeValue}
                        />
                    </div>
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    );
};