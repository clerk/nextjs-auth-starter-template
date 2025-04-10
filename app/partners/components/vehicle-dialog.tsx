"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VehicleForm } from "./vehicle-form";
import type { VehicleFormValues } from "../schemas/vehicle-schema";

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehicleFormValues) => void;
  defaultValues?: Partial<VehicleFormValues>;
  isSubmitting?: boolean;
  isEditMode?: boolean;
  partnerId: string;
}

export function VehicleDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isSubmitting = false,
  isEditMode = false,
  partnerId,
}: VehicleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the vehicle's information."
              : "Fill in the details to add a new vehicle."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <VehicleForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            buttonText={isEditMode ? "Update Vehicle" : "Add Vehicle"}
            partnerId={partnerId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
