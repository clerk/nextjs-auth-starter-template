"use client";

import { useState, useEffect } from "react";
import { PlusIcon, SearchIcon, Loader2, Eye, MoreHorizontal, Car, Calendar, Gauge, Tag } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/hooks/use-debounce";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PlateCarDialog } from "./components/plate-car-dialog";
import { CarFormValues } from "./schemas/car-schema";

// Mock data for cars
const mockCars = [
  {
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
  },
  {
    id: "2",
    make: "BMW",
    model: "7 Series",
    year: 2022,
    licensePlate: "EF-456-GH",
    color: "Silver",
    capacity: 4,
    vehicleType: "LUXURY",
    status: "IN_USE",
    lastMaintenance: "2023-03-20T00:00:00Z",
    isFrenchPlate: true,
    createdAt: "2023-01-15T10:45:00Z",
  },
  {
    id: "3",
    make: "Audi",
    model: "A8",
    year: 2023,
    licensePlate: "IJ-789-KL",
    color: "White",
    capacity: 4,
    vehicleType: "LUXURY",
    status: "AVAILABLE",
    lastMaintenance: "2023-05-05T00:00:00Z",
    isFrenchPlate: true,
    createdAt: "2023-02-01T09:15:00Z",
  },
  {
    id: "4",
    make: "Mercedes-Benz",
    model: "V-Class",
    year: 2022,
    licensePlate: "MN-012-OP",
    color: "Black",
    capacity: 7,
    vehicleType: "VAN",
    status: "AVAILABLE",
    lastMaintenance: "2023-04-10T00:00:00Z",
    isFrenchPlate: true,
    createdAt: "2023-02-10T16:20:00Z",
  },
  {
    id: "5",
    make: "Cadillac",
    model: "Escalade",
    year: 2023,
    licensePlate: "QR-345-ST",
    color: "Black",
    capacity: 6,
    vehicleType: "SUV",
    status: "MAINTENANCE",
    lastMaintenance: "2023-06-01T00:00:00Z",
    isFrenchPlate: false,
    createdAt: "2023-03-05T11:30:00Z",
  },
  {
    id: "6",
    make: "Lincoln",
    model: "Continental",
    year: 2022,
    licensePlate: "UV-678-WX",
    color: "White",
    capacity: 4,
    vehicleType: "SEDAN",
    status: "AVAILABLE",
    lastMaintenance: "2023-05-15T00:00:00Z",
    isFrenchPlate: false,
    createdAt: "2023-03-15T14:45:00Z",
  },
  {
    id: "7",
    make: "Rolls-Royce",
    model: "Phantom",
    year: 2023,
    licensePlate: "YZ-901-AB",
    color: "Black",
    capacity: 4,
    vehicleType: "LUXURY",
    status: "AVAILABLE",
    lastMaintenance: "2023-06-10T00:00:00Z",
    isFrenchPlate: true,
    createdAt: "2023-04-01T09:00:00Z",
  },
  {
    id: "8",
    make: "Mercedes-Benz",
    model: "Sprinter",
    year: 2022,
    licensePlate: "CD-234-EF",
    color: "Silver",
    capacity: 12,
    vehicleType: "VAN",
    status: "OUT_OF_SERVICE",
    lastMaintenance: "2023-02-20T00:00:00Z",
    isFrenchPlate: true,
    createdAt: "2023-04-10T13:15:00Z",
  },
];

export default function CarsPage() {
  const [cars, setCars] = useState(mockCars);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const debouncedSearchQuery = useDebounce(searchTerm, 500); // 500ms debounce delay

  // Filter cars based on search term and status
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus ? car.status === filterStatus : true;

    return matchesSearch && matchesStatus;
  });

  // Handle car creation/update
  const handleCarSubmit = async (data: CarFormValues) => {
    try {
      setIsLoading(true);

      // In a real app, you would call an API here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      if (selectedCar) {
        // Update existing car
        setCars(cars.map(car => car.id === selectedCar.id ? { ...car, ...data } : car));
        toast.success("Vehicle updated successfully");
      } else {
        // Create new car
        const newCar = {
          id: `${cars.length + 1}`,
          ...data,
          createdAt: new Date().toISOString(),
        };
        setCars([...cars, newCar]);
        toast.success("Vehicle created successfully");
      }

      setCarDialogOpen(false);
      setSelectedCar(null);
    } catch (error) {
      console.error("Error handling car submit:", error);
      toast.error("Failed to save vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle car deletion
  const handleDeleteCar = async (id: string) => {
    try {
      setIsLoading(true);

      // In a real app, you would call an API here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setCars(cars.filter(car => car.id !== id));
      toast.success("Vehicle deleted successfully");
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to delete vehicle");
    } finally {
      setIsLoading(false);
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

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
                    <p className="text-muted-foreground">
                      Manage your fleet of vehicles
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => {
                      setSelectedCar(null);
                      setCarDialogOpen(true);
                    }}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Vehicle
                    </Button>
                    <PlateCarDialog
                      open={carDialogOpen}
                      onOpenChange={setCarDialogOpen}
                      onSubmit={handleCarSubmit}
                      defaultValues={selectedCar}
                    />
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <form className="flex w-full max-w-sm items-center space-x-2" onSubmit={(e) => e.preventDefault()}>
                      <Input
                        placeholder="Search vehicles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9"
                      />
                      <Button type="submit" variant="ghost" size="sm" className="h-9 px-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <SearchIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">Search</span>
                      </Button>
                    </form>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setFilterStatus(null)}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("AVAILABLE")}>Available</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("IN_USE")}>In Use</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("MAINTENANCE")}>Maintenance</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("OUT_OF_SERVICE")}>Out of Service</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Cars List with Tabs */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="table" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">
                      {filteredCars.length} vehicles found
                    </div>
                  </div>

                  {/* Table View */}
                  <TabsContent value="table" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>License Plate</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                              </TableCell>
                            </TableRow>
                          ) : filteredCars.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                No vehicles found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredCars.map((car) => (
                              <TableRow key={car.id}>
                                <TableCell>
                                  <div className="font-medium">{car.make} {car.model}</div>
                                  <div className="text-sm text-muted-foreground">{car.color}</div>
                                </TableCell>
                                <TableCell>{car.licensePlate}</TableCell>
                                <TableCell>{getVehicleTypeDisplayName(car.vehicleType)}</TableCell>
                                <TableCell>{car.year}</TableCell>
                                <TableCell>{car.capacity} seats</TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(car.status)}>
                                    {car.status.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      asChild
                                    >
                                      <a href={`/cars/${car.id}`}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                      </a>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedCar(car);
                                        setCarDialogOpen(true);
                                      }}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                      </svg>
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500"
                                      onClick={() => handleDeleteCar(car.id)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        <line x1="10" x2="10" y1="11" y2="17" />
                                        <line x1="14" x2="14" y1="11" y2="17" />
                                      </svg>
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* Grid View */}
                  <TabsContent value="grid" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : filteredCars.length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                          <p className="text-muted-foreground">No vehicles found</p>
                        </div>
                      ) : (
                        filteredCars.map((car) => (
                          <Card key={car.id} className="overflow-hidden">
                            <CardHeader className="p-4 pb-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg font-semibold">
                                    {car.make} {car.model}
                                  </CardTitle>
                                  <CardDescription className="line-clamp-1">
                                    {car.year} • {car.color}
                                  </CardDescription>
                                </div>
                                <Badge className={getStatusColor(car.status)}>
                                  {car.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-3">
                              <div className="flex items-start gap-2">
                                <Car className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm">
                                    {getVehicleTypeDisplayName(car.vehicleType)} • {car.capacity} seats
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <p className="text-sm">{car.licensePlate}</p>
                              </div>
                              {car.lastMaintenance && (
                                <div className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <p className="text-sm">
                                    Last maintenance: {new Date(car.lastMaintenance).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                asChild
                              >
                                <a href={`/cars/${car.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </a>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedCar(car);
                                    setCarDialogOpen(true);
                                  }}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteCar(car.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </CardFooter>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
