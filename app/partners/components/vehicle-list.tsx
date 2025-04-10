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
import { VehicleDialog } from "./vehicle-dialog";
import { VehicleFormValues } from "../schemas/vehicle-schema";
import { Car, Edit, Loader2, MoreHorizontalIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

// Vehicle type definition
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  isForeignPlate: boolean;
  color?: string;
  capacity: number;
  vehicleType: string;
  status: string;
  lastMaintenance?: string;
  fuelType?: string;
  registrationDate?: string;
  createdAt: string;
  updatedAt: string;
  partnerId: string;
}

interface VehicleListProps {
  partnerId: string;
}

export function VehicleList({ partnerId }: VehicleListProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVehicleId, setCurrentVehicleId] = useState<string | null>(null);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [showDeleteVehicleDialog, setShowDeleteVehicleDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [defaultValues, setDefaultValues] = useState<Partial<VehicleFormValues>>({});

  // Fetch partner vehicles
  const fetchPartnerVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/partners/${partnerId}/vehicles`);
      if (!response.ok) {
        throw new Error("Failed to fetch partner vehicles");
      }

      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching partner vehicles:", error);
      toast.error("Failed to load partner vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchPartnerVehicles();
    }
  }, [partnerId]);

  // Handle add vehicle
  const handleAddVehicle = () => {
    setCurrentVehicleId(null);
    setIsEditingVehicle(false);
    setDefaultValues({
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      licensePlate: "",
      isForeignPlate: false,
      color: "",
      capacity: "4",
      vehicleType: "SEDAN",
      status: "AVAILABLE",
      lastMaintenance: "",
    });
    setShowVehicleDialog(true);
  };

  // Handle edit vehicle
  const handleEditVehicle = async (vehicleId: string) => {
    setCurrentVehicleId(vehicleId);
    setIsEditingVehicle(true);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/partners/${partnerId}/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle details");
      }

      const vehicleData = await response.json();
      
      // Convert numeric values to strings for the form
      const formData = {
        ...vehicleData,
        year: vehicleData.year.toString(),
        capacity: vehicleData.capacity.toString(),
        lastMaintenance: vehicleData.lastMaintenance || "",
      };

      setDefaultValues(formData);
      setShowVehicleDialog(true);
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Failed to load vehicle details");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      const response = await fetch(`/api/partners/${partnerId}/vehicles/${vehicleToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete vehicle");
      }

      toast.success(`Vehicle ${vehicleToDelete.make} ${vehicleToDelete.model} deleted successfully`);
      setShowDeleteVehicleDialog(false);
      setVehicleToDelete(null);
      fetchPartnerVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete vehicle");
    }
  };

  // Confirm delete vehicle
  const confirmDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteVehicleDialog(true);
  };

  // Handle vehicle form submission
  const handleSubmitVehicle = async (data: VehicleFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditingVehicle && currentVehicleId
        ? `/api/partners/${partnerId}/vehicles/${currentVehicleId}`
        : `/api/partners/${partnerId}/vehicles`;

      const method = isEditingVehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save vehicle");
      }

      const savedVehicle = await response.json();
      
      toast.success(
        isEditingVehicle
          ? `Vehicle ${savedVehicle.make} ${savedVehicle.model} updated successfully`
          : `Vehicle ${savedVehicle.make} ${savedVehicle.model} added successfully`
      );

      setShowVehicleDialog(false);
      fetchPartnerVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vehicles</CardTitle>
            <CardDescription>
              Vehicles owned or operated by this partner
            </CardDescription>
          </div>
          <Button onClick={handleAddVehicle}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading vehicles...
                    </div>
                  </TableCell>
                </TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No vehicles found for this partner.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.year} • {vehicle.color || "No color"}
                            {vehicle.fuelType && ` • ${vehicle.fuelType}`}
                          </div>
                          {vehicle.registrationDate && (
                            <div className="text-xs text-muted-foreground">
                              Registered: {new Date(vehicle.registrationDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {vehicle.licensePlate}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.isForeignPlate ? "Non-French plate" : "French plate"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vehicle.vehicleType.charAt(0) + vehicle.vehicleType.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vehicle.status === "AVAILABLE" ? (
                        <Badge variant="success">Available</Badge>
                      ) : vehicle.status === "IN_USE" ? (
                        <Badge variant="default">In Use</Badge>
                      ) : vehicle.status === "MAINTENANCE" ? (
                        <Badge variant="warning">Maintenance</Badge>
                      ) : (
                        <Badge variant="destructive">Out of Service</Badge>
                      )}
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
                            onClick={() => handleEditVehicle(vehicle.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => confirmDeleteVehicle(vehicle)}
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
        {vehicles.length > 0 && (
          <CardFooter className="flex justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Total vehicles: {vehicles.length}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Vehicle Dialog */}
      <VehicleDialog
        open={showVehicleDialog}
        onOpenChange={setShowVehicleDialog}
        onSubmit={handleSubmitVehicle}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        isEditMode={isEditingVehicle}
        partnerId={partnerId}
      />

      {/* Delete Vehicle Confirmation Dialog */}
      <AlertDialog open={showDeleteVehicleDialog} onOpenChange={setShowDeleteVehicleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
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
