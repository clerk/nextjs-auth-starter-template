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
import { SimpleCarForm } from "./simple-car-form";

interface SimpleCarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: any;
}

export function SimpleCarDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: SimpleCarDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
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
        <SimpleCarForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
