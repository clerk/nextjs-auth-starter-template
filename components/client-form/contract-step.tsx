"use client"

import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { clientFormSchema } from "@/app/clients/schemas/client-schema"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientContractStepProps {
  form: UseFormReturn<ClientFormValues>
}

export function ClientContractStep({ form }: ClientContractStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Contract Information</h2>
        <p className="text-sm text-muted-foreground">
          Enter the contract details and status of the client.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contractStart"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contractEnd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-normal cursor-pointer">
                Active client
              </FormLabel>
              <FormDescription>
                Inactive clients won't appear in dropdown menus for new bookings
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
