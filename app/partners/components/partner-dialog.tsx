"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PartnerForm } from "./partner-form";
import type { PartnerFormValues } from "../schemas/partner-schema";

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PartnerFormValues) => void;
  defaultValues?: Partial<PartnerFormValues>;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export function PartnerDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isSubmitting = false,
  isEditMode = false,
}: PartnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Partner" : "Add New Partner"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the partner's information."
              : "Fill in the details to create a new partner."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PartnerForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            buttonText={isEditMode ? "Update Partner" : "Add Partner"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
