"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Car, Calendar, Tag, Gauge, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlateCarDialog } from "../components/plate-car-dialog";
import { VehicleAssignmentDialog } from "../components/vehicle-assignment-dialog";
import { CarFormValues } from "../schemas/car-schema";
import { deleteVehicle, getVehicleById, updateVehicle } from "../actions";

// Mock data for a single car (in a real app, this would come from an API)
const mockCar = {
  id: "1",
  make: "Mercedes-Benz",
  model: "S-Class",
  year: 2023,
  licensePlate: "AB-123-CD",
  color: "Black",
  capacity: 4,
  vehicleType: "LUXURY",
  status: "AVAILABLE",
  lastMaintenance: "2023-04-15T00:00:00Z",
  isFrenchPlate: true,
  createdAt: "2023-01-10T14:30:00Z",
  // Additional details for the detail page
  vin: "WDDUG8CB7LA456789",
  fuelType: "Diesel",
  mileage: 15000,
  nextMaintenanceDue: "2023-10-15T00:00:00Z",
  insuranceExpiryDate: "2024-01-10T00:00:00Z",
  registrationExpiryDate: "2024-01-10T00:00:00Z",
  notes: "Premium vehicle for VIP clients. Regular maintenance required.",
};

// Mock maintenance history
const mockMaintenanceHistory = [
  {
    id: "1",
    date: "2023-04-15T00:00:00Z",
    type: "Regular Service",
    description: "Oil change, filter replacement, general inspection",
    cost: 350,
    mileage: 12000,
  },
  {
    id: "2",
    date: "2023-01-20T00:00:00Z",
    type: "Tire Replacement",
    description: "Replaced all four tires with premium winter tires",
    cost: 1200,
    mileage: 10000,
  },
  {
    id: "3",
    date: "2022-10-05T00:00:00Z",
    type: "Regular Service",
    description: "Oil change, brake inspection, fluid top-up",
    cost: 280,
    mileage: 7500,
  },
];

// Mock ride history
const mockRideHistory = [
  {
    id: "1",
    date: "2023-06-10T09:00:00Z",
    client: "John Smith",
    from: "Charles de Gaulle Airport",
    to: "Hotel Ritz Paris",
    distance: 35,
    duration: 45,
  },
  {
    id: "2",
    date: "2023-06-08T14:30:00Z",
    client: "Emma Johnson",
    from: "Hotel Four Seasons",
    to: "Eiffel Tower",
    distance: 5,
    duration: 15,
  },
  {
    id: "3",
    date: "2023-06-05T19:00:00Z",
    client: "Robert Williams",
    from: "Le Bourget Airport",
    to: "Champs-Élysées",
    distance: 20,
    duration: 30,
  },
];

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [maintenanceHistory, setMaintenanceHistory] = useState(mockMaintenanceHistory);
  const [rideHistory, setRideHistory] = useState(mockRideHistory);

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        if (!params.carId || typeof params.carId !== 'string') {
          toast.error("Invalid vehicle ID");
          return;
        }

        const result = await getVehicleById(params.carId);

        if (result.success) {
          setCar({
            ...result.data,
            // Add additional mock details for the detail page
            vin: "WDDUG8CB7LA456789",
            fuelType: "Diesel",
            mileage: 15000,
            nextMaintenanceDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
            insuranceExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days from now
            registrationExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 365 days from now
            notes: "Vehicle information fetched from database. Additional details are mock data.",
          });
        } else {
          toast.error(result.error || "Failed to load vehicle details");
        }
      } catch (error) {
        console.error("Error fetching car:", error);
        toast.error("Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [params.carId]);

  // Handle car update
  const handleCarUpdate = async (data: CarFormValues) => {
    try {
      if (!car || !car.id) {
        toast.error("No vehicle to update");
        return;
      }

      const result = await updateVehicle(car.id, data);

      if (result.success) {
        // Update the car in the local state, preserving the mock data
        setCar({
          ...result.data,
          vin: car.vin,
          fuelType: car.fuelType,
          mileage: car.mileage,
          nextMaintenanceDue: car.nextMaintenanceDue,
          insuranceExpiryDate: car.insuranceExpiryDate,
          registrationExpiryDate: car.registrationExpiryDate,
          notes: car.notes,
        });
        toast.success("Vehicle updated successfully");
        setCarDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to update vehicle");
      }
    } catch (error) {
      console.error("Error updating car:", error);
      toast.error("Failed to update vehicle");
    }
  };

  // Handle car deletion
  const handleDeleteCar = async () => {
    try {
      if (!car || !car.id) {
        toast.error("No vehicle to delete");
        return;
      }

      const result = await deleteVehicle(car.id);

      if (result.success) {
        toast.success("Vehicle deleted successfully");
        router.push("/cars");
      } else {
        toast.error(result.error || "Failed to delete vehicle");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800";
      case "IN_USE": return "bg-blue-100 text-blue-800";
      case "MAINTENANCE": return "bg-yellow-100 text-yellow-800";
      case "OUT_OF_SERVICE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get vehicle type display name
  const getVehicleTypeDisplayName = (type: string) => {
    switch (type) {
      case "SEDAN": return "Sedan";
      case "SUV": return "SUV";
      case "VAN": return "Van";
      case "LUXURY": return "Luxury";
      case "LIMOUSINE": return "Limousine";
      default: return type;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center">
                  <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h1 className="text-2xl font-bold">Loading vehicle details...</h1>
                </div>
                <div className="h-96 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!car) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center">
                  <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h1 className="text-2xl font-bold">Vehicle not found</h1>
                </div>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-60">
                    <Car className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">The requested vehicle could not be found.</p>
                    <Button onClick={() => router.push("/cars")} className="mt-4">
                      Go to Vehicles
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {/* Header with back button */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">{car.make} {car.model}</h1>
                    <p className="text-muted-foreground">{car.licensePlate} • {car.year}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setCarDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setAssignmentDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/cars/${car.id}/maintenance/new`)}>
                        Add Maintenance Record
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/cars/${car.id}/documents`)}>
                        Manage Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={handleDeleteCar}>
                        Delete Vehicle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Current Assignment (if any) */}
              {car.status === "IN_USE" && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Current Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="font-medium">Assigned to Event: Corporate Meeting</p>
                        <p className="text-sm text-muted-foreground">April 15, 2025 - April 20, 2025</p>
                      </div>
                      <Button variant="outline" size="sm" className="md:self-end">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Car details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main info card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Vehicle Details</CardTitle>
                      <Badge className={getStatusColor(car.status)}>
                        {car.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription>{getVehicleTypeDisplayName(car.vehicleType)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm">Brand:</div>
                            <div className="text-sm font-medium">{car.make}</div>
                            <div className="text-sm">Model:</div>
                            <div className="text-sm font-medium">{car.model}</div>
                            <div className="text-sm">Year:</div>
                            <div className="text-sm font-medium">{car.year}</div>
                            <div className="text-sm">Color:</div>
                            <div className="text-sm font-medium">{car.color}</div>
                            <div className="text-sm">Capacity:</div>
                            <div className="text-sm font-medium">{car.capacity} seats</div>
                            <div className="text-sm">VIN:</div>
                            <div className="text-sm font-medium">{car.vin}</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Registration</h3>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm">License Plate:</div>
                            <div className="text-sm font-medium">{car.licensePlate}</div>
                            <div className="text-sm">French Plate:</div>
                            <div className="text-sm font-medium">{car.isFrenchPlate ? "Yes" : "No"}</div>
                            <div className="text-sm">Registration Expires:</div>
                            <div className="text-sm font-medium">{formatDate(car.registrationExpiryDate)}</div>
                            <div className="text-sm">Insurance Expires:</div>
                            <div className="text-sm font-medium">{formatDate(car.insuranceExpiryDate)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Technical Information</h3>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm">Fuel Type:</div>
                            <div className="text-sm font-medium">{car.fuelType}</div>
                            <div className="text-sm">Current Mileage:</div>
                            <div className="text-sm font-medium">{car.mileage.toLocaleString()} km</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Maintenance</h3>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm">Last Maintenance:</div>
                            <div className="text-sm font-medium">{formatDate(car.lastMaintenance)}</div>
                            <div className="text-sm">Next Maintenance Due:</div>
                            <div className="text-sm font-medium">{formatDate(car.nextMaintenanceDue)}</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                          <Separator className="my-2" />
                          <p className="text-sm">{car.notes || "No notes available."}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar info card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Current Status</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(car.status)}>
                          {car.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Upcoming Maintenance</h3>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Due: {formatDate(car.nextMaintenanceDue)}</p>
                          <p className="text-sm text-muted-foreground">Regular service</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="justify-start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 mr-2"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          Registration Certificate
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 mr-2"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          Insurance Policy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for additional information */}
              <Tabs defaultValue="maintenance" className="mt-4">
                <TabsList>
                  <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
                  <TabsTrigger value="rides">Ride History</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="maintenance" className="mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Maintenance History</CardTitle>
                        <Button size="sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 mr-2"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Add Record
                        </Button>
                      </div>
                      <CardDescription>View all maintenance records for this vehicle</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {maintenanceHistory.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No maintenance records found.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {maintenanceHistory.map((record) => (
                            <div key={record.id} className="flex flex-col md:flex-row md:items-start gap-4 border-b pb-4">
                              <div className="md:w-1/4">
                                <p className="font-medium">{formatDate(record.date)}</p>
                                <p className="text-sm text-muted-foreground">{record.type}</p>
                              </div>
                              <div className="md:w-2/4">
                                <p className="text-sm">{record.description}</p>
                                <p className="text-sm text-muted-foreground">Mileage: {record.mileage.toLocaleString()} km</p>
                              </div>
                              <div className="md:w-1/4 text-right">
                                <p className="font-medium">€{record.cost.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="rides" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ride History</CardTitle>
                      <CardDescription>Recent rides using this vehicle</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {rideHistory.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No ride history found.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {rideHistory.map((ride) => (
                            <div key={ride.id} className="flex flex-col md:flex-row md:items-start gap-4 border-b pb-4">
                              <div className="md:w-1/4">
                                <p className="font-medium">{new Date(ride.date).toLocaleDateString()}</p>
                                <p className="text-sm text-muted-foreground">{new Date(ride.date).toLocaleTimeString()}</p>
                              </div>
                              <div className="md:w-2/4">
                                <p className="text-sm font-medium">{ride.client}</p>
                                <p className="text-sm">From: {ride.from}</p>
                                <p className="text-sm">To: {ride.to}</p>
                              </div>
                              <div className="md:w-1/4 text-right">
                                <p className="text-sm">{ride.distance} km</p>
                                <p className="text-sm text-muted-foreground">{ride.duration} min</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="documents" className="mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Documents</CardTitle>
                        <Button size="sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 mr-2"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Upload Document
                        </Button>
                      </div>
                      <CardDescription>Vehicle documents and certificates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="p-4">
                            <CardTitle className="text-base">Registration Certificate</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">Uploaded on {formatDate("2023-01-15T00:00:00Z")}</p>
                            <p className="text-sm text-muted-foreground">Expires on {formatDate(car.registrationExpiryDate)}</p>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button variant="outline" size="sm" className="w-full">View Document</Button>
                          </CardFooter>
                        </Card>
                        <Card>
                          <CardHeader className="p-4">
                            <CardTitle className="text-base">Insurance Policy</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">Uploaded on {formatDate("2023-01-15T00:00:00Z")}</p>
                            <p className="text-sm text-muted-foreground">Expires on {formatDate(car.insuranceExpiryDate)}</p>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button variant="outline" size="sm" className="w-full">View Document</Button>
                          </CardFooter>
                        </Card>
                        <Card>
                          <CardHeader className="p-4">
                            <CardTitle className="text-base">Technical Inspection</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">Uploaded on {formatDate("2023-02-20T00:00:00Z")}</p>
                            <p className="text-sm text-muted-foreground">Expires on {formatDate("2024-02-20T00:00:00Z")}</p>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button variant="outline" size="sm" className="w-full">View Document</Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
      <PlateCarDialog
        open={carDialogOpen}
        onOpenChange={setCarDialogOpen}
        onSubmit={handleCarUpdate}
        defaultValues={car}
      />
      <VehicleAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        vehicleId={car?.id || ""}
        vehicleName={`${car?.make || ""} ${car?.model || ""} (${car?.licensePlate || ""})`}
      />
    </SidebarProvider>
  );
}
