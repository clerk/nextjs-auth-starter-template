"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CarForm } from "./car-form";
import { CarFormValues } from "../schemas/car-schema";

interface CarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CarFormValues) => Promise<void>;
  defaultValues?: Partial<CarFormValues>;
}

export function CarDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: CarDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CarFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onOpenChange(false);
      toast.success(defaultValues ? "Vehicle updated successfully" : "Vehicle created successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues
              ? "Edit the vehicle details below."
              : "Fill in the details to add a new vehicle."}
          </DialogDescription>
        </DialogHeader>
        <CarForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
