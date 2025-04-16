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
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventClientStepProps {
  form: UseFormReturn<EventFormValues>
  clients: { id: string; name: string }[]
  isLoading: boolean
  onAddClient: () => void
}

export function EventClientStep({ form, clients, isLoading, onAddClient }: EventClientStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Client Information</h2>
        <p className="text-sm text-muted-foreground">
          Select the client for this event or create a new one.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      {isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Loading clients...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a client" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onAddClient}
                  className="flex items-center w-full sm:w-auto justify-center"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>New Client</span>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("clientId") && clients.length > 0 && (
          <div className="p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Selected Client</h3>
            <p className="text-sm">
              {clients.find(c => c.id === form.watch("clientId"))?.name || "Unknown client"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
