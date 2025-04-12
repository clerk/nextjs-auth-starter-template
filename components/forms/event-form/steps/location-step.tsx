"use client"

import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { eventFormSchema } from "../schemas/event-schema"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { MapPin } from "lucide-react"

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventLocationStepProps {
  form: UseFormReturn<EventFormValues>
}

export function EventLocationStep({ form }: EventLocationStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Location Information</h2>
        <p className="text-sm text-muted-foreground">
          Enter the location details for the event.
        </p>
      </div>

      <Separator />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="Event location" 
                  {...field} 
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="p-4 border rounded-md bg-muted/50">
        <h3 className="font-medium mb-2">Location Tips</h3>
        <ul className="text-sm space-y-1 list-disc pl-5">
          <li>Include the full address with street number</li>
          <li>Add building name or floor number if applicable</li>
          <li>Include city and postal code</li>
          <li>Add any special instructions for finding the location</li>
        </ul>
      </div>
    </div>
  )
}
