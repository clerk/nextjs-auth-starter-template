"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChauffeurDialog } from "./chauffeur-dialog";
import { ChauffeurFormValues } from "../schemas/chauffeur-schema";
import { Car, Edit, FileText, Loader2, MoreHorizontalIcon, PlusIcon, TrashIcon, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { DocumentDialog } from "./document-dialog";

// Chauffeur type definition
interface Chauffeur {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: string;
  isExternalChauffeur: boolean;
  nextIsChauffeurId?: string;
  vehicleId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  partnerId: string;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
    expiryDate?: string;
    isVerified: boolean;
  }[];
}

interface ChauffeurListProps {
  partnerId: string;
}

export function ChauffeurList({ partnerId }: ChauffeurListProps) {
  const router = useRouter();
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChauffeurDialog, setShowChauffeurDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentChauffeurId, setCurrentChauffeurId] = useState<string | null>(null);
  const [isEditingChauffeur, setIsEditingChauffeur] = useState(false);
  const [showDeleteChauffeurDialog, setShowDeleteChauffeurDialog] = useState(false);
  const [chauffeurToDelete, setChauffeurToDelete] = useState<Chauffeur | null>(null);
  const [defaultValues, setDefaultValues] = useState<Partial<ChauffeurFormValues>>({});

  // Fetch partner chauffeurs
  const fetchPartnerChauffeurs = async () => {
    setIsLoading(true);
    try {
      // Add error handling and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/partners/${partnerId}/chauffeurs`, {
        signal: controller.signal
      }).catch(err => {
        console.error("Fetch error:", err);
        throw new Error("Network error when fetching chauffeurs");
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Failed to fetch partner chauffeurs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setChauffeurs(data);
    } catch (error) {
      console.error("Error fetching partner chauffeurs:", error);
      // Set empty array to prevent continuous loading state
      setChauffeurs([]);
      toast.error(error instanceof Error ? error.message : "Failed to load partner chauffeurs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchPartnerChauffeurs();
    }
  }, [partnerId]);

  // Handle add chauffeur
  const handleAddChauffeur = () => {
    setCurrentChauffeurId(null);
    setIsEditingChauffeur(false);
    setDefaultValues({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      licenseNumber: "",
      licenseExpiry: new Date().toISOString().split('T')[0],
      isExternalChauffeur: false,
      nextIsChauffeurId: "",
      notes: "",
      status: "AVAILABLE",
    });
    setShowChauffeurDialog(true);
  };

  // Handle edit chauffeur
  const handleEditChauffeur = async (chauffeurId: string) => {
    setCurrentChauffeurId(chauffeurId);
    setIsEditingChauffeur(true);
    setIsSubmitting(true);

    try {
      // Add error handling and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/partners/${partnerId}/chauffeurs/${chauffeurId}`, {
        signal: controller.signal
      }).catch(err => {
        console.error("Fetch error:", err);
        throw new Error("Network error when fetching chauffeur details");
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Failed to fetch chauffeur details: ${response.status} ${response.statusText}`);
      }

      const chauffeurData = await response.json();
      
      // Format data for the form
      const formData = {
        ...chauffeurData,
        licenseExpiry: new Date(chauffeurData.licenseExpiry).toISOString().split('T')[0],
      };

      setDefaultValues(formData);
      setShowChauffeurDialog(true);
    } catch (error) {
      console.error("Error fetching chauffeur details:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load chauffeur details");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add document
  const handleAddDocument = (chauffeurId: string) => {
    setCurrentChauffeurId(chauffeurId);
    setShowDocumentDialog(true);
  };

  // Handle delete chauffeur
  const handleDeleteChauffeur = async () => {
    if (!chauffeurToDelete) return;

    try {
      // Add error handling and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/partners/${partnerId}/chauffeurs/${chauffeurToDelete.id}`, {
        method: "DELETE",
        signal: controller.signal
      }).catch(err => {
        console.error("Fetch error:", err);
        throw new Error("Network error when deleting chauffeur");
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to delete chauffeur";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        
        throw new Error(errorMessage);
      }

      toast.success(`Chauffeur ${chauffeurToDelete.firstName} ${chauffeurToDelete.lastName} deleted successfully`);
      setShowDeleteChauffeurDialog(false);
      setChauffeurToDelete(null);
      fetchPartnerChauffeurs();
    } catch (error) {
      console.error("Error deleting chauffeur:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete chauffeur");
    }
  };

  // Confirm delete chauffeur
  const confirmDeleteChauffeur = (chauffeur: Chauffeur) => {
    setChauffeurToDelete(chauffeur);
    setShowDeleteChauffeurDialog(true);
  };

  // Handle chauffeur form submission
  const handleSubmitChauffeur = async (data: ChauffeurFormValues) => {
    console.log('Chauffeur list received form data:', data);
    
    // Check if all required fields are present
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'licenseNumber', 'licenseExpiry'];
    const missingFields = requiredFields.filter(field => !data[field as keyof ChauffeurFormValues]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields in chauffeur list:', missingFields);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = isEditingChauffeur && currentChauffeurId
        ? `/api/partners/${partnerId}/chauffeurs/${currentChauffeurId}`
        : `/api/partners/${partnerId}/chauffeurs`;

      const method = isEditingChauffeur ? "PUT" : "POST";

      // Add error handling and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal
      }).catch(err => {
        console.error("Fetch error:", err);
        throw new Error("Network error when saving chauffeur");
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to save chauffeur";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        
        throw new Error(errorMessage);
      }

      const savedChauffeur = await response.json();
      
      toast.success(
        isEditingChauffeur
          ? `Chauffeur ${savedChauffeur.firstName} ${savedChauffeur.lastName} updated successfully`
          : `Chauffeur ${savedChauffeur.firstName} ${savedChauffeur.lastName} added successfully`
      );

      setShowChauffeurDialog(false);
      fetchPartnerChauffeurs();
    } catch (error) {
      console.error("Error saving chauffeur:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save chauffeur");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle document form submission
  const handleSubmitDocument = async (formData: FormData) => {
    if (!currentChauffeurId) {
      toast.error("No chauffeur selected for document upload");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = `/api/partners/${partnerId}/chauffeurs/${currentChauffeurId}/documents`;

      // Add error handling and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Longer timeout for file upload
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal
      }).catch(err => {
        console.error("Fetch error:", err);
        throw new Error("Network error when uploading document");
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to upload document";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        
        throw new Error(errorMessage);
      }

      const savedDocument = await response.json();
      
      toast.success(`Document ${savedDocument.name} uploaded successfully`);

      setShowDocumentDialog(false);
      fetchPartnerChauffeurs();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success">Available</Badge>;
      case "BUSY":
        return <Badge variant="default">Busy</Badge>;
      case "ON_LEAVE":
        return <Badge variant="warning">On Leave</Badge>;
      case "INACTIVE":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chauffeurs</CardTitle>
            <CardDescription>
              Chauffeurs associated with this partner
            </CardDescription>
          </div>
          <Button onClick={handleAddChauffeur}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Chauffeur
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chauffeur</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading chauffeurs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : chauffeurs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p>No chauffeurs found for this partner.</p>
                      <p className="text-sm text-muted-foreground">
                        Click the "Add Chauffeur" button to add a chauffeur.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                chauffeurs.map((chauffeur) => (
                  <TableRow key={chauffeur.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {chauffeur.firstName} {chauffeur.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {chauffeur.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {chauffeur.phone}
                          </div>
                          {chauffeur.nextIsChauffeurId && (
                            <Badge variant="outline" className="mt-1">
                              NextIS ID: {chauffeur.nextIsChauffeurId}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {chauffeur.licenseNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires: {format(new Date(chauffeur.licenseExpiry), "PP")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {chauffeur.vehicle ? (
                        <div>
                          <div className="font-medium">
                            {chauffeur.vehicle.make} {chauffeur.vehicle.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {chauffeur.vehicle.licensePlate}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No vehicle assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(chauffeur.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {chauffeur.documents.length} documents
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddDocument(chauffeur.id)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEditChauffeur(chauffeur.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => confirmDeleteChauffeur(chauffeur)}
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {chauffeurs.length > 0 && (
          <CardFooter className="flex justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Total chauffeurs: {chauffeurs.length}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Chauffeur Dialog */}
      <ChauffeurDialog
        open={showChauffeurDialog}
        onOpenChange={setShowChauffeurDialog}
        onSubmit={handleSubmitChauffeur}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        isEditMode={isEditingChauffeur}
        partnerId={partnerId}
      />

      {/* Document Dialog */}
      <DocumentDialog
        open={showDocumentDialog}
        onOpenChange={setShowDocumentDialog}
        onSubmit={handleSubmitDocument}
        isSubmitting={isSubmitting}
        entityType="chauffeur"
      />

      {/* Delete Chauffeur Confirmation Dialog */}
      <AlertDialog open={showDeleteChauffeurDialog} onOpenChange={setShowDeleteChauffeurDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chauffeur from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChauffeur}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
