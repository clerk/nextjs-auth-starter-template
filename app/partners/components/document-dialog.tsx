"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentFormSchema, type DocumentFormValues } from "../schemas/document-schema";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
  isSubmitting?: boolean;
  entityType: "chauffeur" | "vehicle";
}

export function DocumentDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  entityType,
}: DocumentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      type: entityType === "chauffeur" ? "DRIVER_LICENSE" : "REGISTRATION_CARD",
      expiryDate: "",
      notes: "",
      isVerified: false,
    },
  });

  const handleSubmit = (data: DocumentFormValues) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", data.name);
    formData.append("type", data.type);
    
    if (data.expiryDate) {
      formData.append("expiryDate", data.expiryDate);
    }
    
    if (data.notes) {
      formData.append("notes", data.notes);
    }
    
    formData.append("isVerified", data.isVerified.toString());

    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file && !form.getValues("name")) {
      // Set the document name to the file name if not already set
      form.setValue("name", file.name.split(".")[0]);
    }
  };

  const getChauffeurDocumentTypes = () => (
    <>
      <SelectItem value="DRIVER_LICENSE">Driver License</SelectItem>
      <SelectItem value="IDENTITY_CARD">Identity Card</SelectItem>
      <SelectItem value="VTC_CARD">VTC Card</SelectItem>
    </>
  );

  const getVehicleDocumentTypes = () => (
    <>
      <SelectItem value="REGISTRATION_CARD">Registration Card (Carte Grise)</SelectItem>
      <SelectItem value="INSURANCE_CERTIFICATE">Insurance Certificate</SelectItem>
      <SelectItem value="TECHNICAL_INSPECTION">Technical Inspection</SelectItem>
      <SelectItem value="VTC_REGISTRY">VTC Registry</SelectItem>
      <SelectItem value="EXPLOITATION_CERTIFICATE">Exploitation Certificate</SelectItem>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload a document for this {entityType}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* File Upload */}
              <FormItem className="grid w-full gap-1.5">
                <FormLabel>Document File*</FormLabel>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    className="flex-1"
                    onChange={handleFileChange}
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <FormDescription>
                  Upload a PDF, image, or document file.
                </FormDescription>
              </FormItem>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Document Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Document Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter document name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Document Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {entityType === "chauffeur" 
                            ? getChauffeurDocumentTypes() 
                            : getVehicleDocumentTypes()
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expiry Date */}
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) =>
                              field.onChange(date ? date.toISOString().split('T')[0] : "")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Optional: Set an expiry date for this document.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Verified */}
                <FormField
                  control={form.control}
                  name="isVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Verified Document</FormLabel>
                        <FormDescription>
                          Mark this document as verified
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional notes about this document"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !selectedFile}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="mr-2 h-4 w-4" />
                  )}
                  Upload Document
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
