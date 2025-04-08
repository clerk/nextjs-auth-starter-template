"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventForm } from "./event-form";
import type { EventFormValues } from "./types";
import { useState } from "react";
import { toast } from "sonner";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: EventFormValues) => void;
  defaultValues?: Partial<EventFormValues>;
  onClose?: () => void;
}

export function EventDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  onClose
}: EventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);

      // If onSubmit is provided, use it
      if (onSubmit) {
        await onSubmit(data);
        onOpenChange(false);
        return;
      }

      // Otherwise, use the default API call
      const url = defaultValues?.id
        ? `/api/events/${defaultValues.id}`
        : '/api/events';

      const method = defaultValues?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save event');
      }

      toast.success(defaultValues?.id ? 'Event updated successfully' : 'Event created successfully');
      onOpenChange(false);

      // Call onClose if provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues
              ? "Edit the event details below."
              : "Fill in the details to create a new event."}
          </DialogDescription>
        </DialogHeader>
        <EventForm onSubmit={handleSubmit} defaultValues={defaultValues} />
      </DialogContent>
    </Dialog>
  );
}