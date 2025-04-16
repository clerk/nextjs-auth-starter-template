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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EVENT_STATUSES, EVENT_PRICING_TYPES } from "../constants/event-constants"

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventPricingStepProps {
  form: UseFormReturn<EventFormValues>
}

export function EventPricingStep({ form }: EventPricingStepProps) {
  // Watch pricing type to conditionally show fixed price field
  const pricingType = form.watch('pricingType')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pricing & Status</h2>
        <p className="text-sm text-muted-foreground">
          Set the pricing model and status for this event.
        </p>
      </div>

      <Separator />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EVENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
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
        name="pricingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pricing Model</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing model" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EVENT_PRICING_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'MISSION_BASED' ? 'Mission Based' : 'Fixed Price'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              {field.value === 'MISSION_BASED'
                ? 'Price will be calculated based on individual missions'
                : 'Set a fixed price for the entire event'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {pricingType === 'FIXED_PRICE' && (
        <FormField
          control={form.control}
          name="fixedPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Fixed Price (€) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  value={field.value}
                  className={field.value <= 0 ? "border-destructive" : ""}
                />
              </FormControl>
              <FormDescription>
                Please enter a valid price amount greater than zero
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Additional notes about pricing, billing, or special requirements"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
