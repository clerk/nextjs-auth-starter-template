"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChauffeurForm } from "./chauffeur-form";
import type { ChauffeurFormValues } from "../schemas/chauffeur-schema";

interface ChauffeurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ChauffeurFormValues) => void;
  defaultValues?: Partial<ChauffeurFormValues>;
  isSubmitting?: boolean;
  isEditMode?: boolean;
  partnerId: string;
}

export function ChauffeurDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isSubmitting = false,
  isEditMode = false,
  partnerId,
}: ChauffeurDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Chauffeur" : "Add New Chauffeur"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the chauffeur's information."
              : "Fill in the details to add a new chauffeur."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ChauffeurForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            buttonText={isEditMode ? "Update Chauffeur" : "Add Chauffeur"}
            partnerId={partnerId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
