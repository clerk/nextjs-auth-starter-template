"use client";

import { useState, useEffect } from "react";
import type { Chauffeur, ChauffeurFormValues } from "@/components/forms/chauffeur-form/types";
import { ChauffeurCategory } from "@/components/forms/chauffeur-form/types";
import { ChauffeurDialog } from "@/components/forms/chauffeur-form/chauffeur-dialog";
import { PlusIcon, Loader2, SearchIcon, Car, Calendar, User, Phone, MoreHorizontal, Eye } from "lucide-react";
import { format } from "date-fns";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function ChauffeursPage() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chauffeurDialogOpen, setChauffeurDialogOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce delay

  // Fetch chauffeurs from the API
  useEffect(() => {
    const fetchChauffeurs = async () => {
      try {
        setIsLoading(true);
        let url = '/api/chauffeurs';

        // Add filter if selected
        if (filterStatus) {
          url += `?status=${filterStatus}`;
        }

        // For now, use mock data since the API might not be fully implemented
        // In a real implementation, you would fetch from the API
        const mockChauffeurs: Chauffeur[] = [
          {
            id: "chauffeur_1",
            userId: "user_1",
            firstName: "John",
            lastName: "Doe",
            fullName: "John Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            licenseNumber: "DL12345678",
            licenseExpiry: new Date("2025-12-31"),
            vtcCardNumber: "VTC2023001",
            vtcValidationDate: new Date("2023-05-15"),
            status: "AVAILABLE",
            category: ChauffeurCategory.HIGH_END,
            vehicle: {
              id: "vehicle_1",
              name: "Mercedes S-Class",
              licensePlate: "ABC123",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "chauffeur_2",
            userId: "user_2",
            firstName: "Jane",
            lastName: "Smith",
            fullName: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "+0987654321",
            licenseNumber: "DL87654321",
            licenseExpiry: new Date("2024-10-15"),
            vtcCardNumber: "VTC2023002",
            vtcValidationDate: new Date("2023-08-22"),
            status: "BUSY",
            category: ChauffeurCategory.BUSINESS,
            vehicle: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "chauffeur_3",
            userId: "user_3",
            firstName: "Michael",
            lastName: "Johnson",
            fullName: "Michael Johnson",
            email: "michael.johnson@example.com",
            phone: "+1122334455",
            licenseNumber: "DL11223344",
            licenseExpiry: new Date("2026-05-20"),
            vtcCardNumber: "VTC2023003",
            vtcValidationDate: new Date("2023-11-10"),
            status: "ON_BREAK",
            category: ChauffeurCategory.ECONOMY,
            vehicle: {
              id: "vehicle_2",
              name: "BMW 7 Series",
              licensePlate: "XYZ789",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        // Filter chauffeurs based on status if selected
        let filteredData = filterStatus
          ? mockChauffeurs.filter(chauffeur => chauffeur.status === filterStatus)
          : mockChauffeurs;

        // Filter chauffeurs based on search query if provided
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredData = filteredData.filter((chauffeur: Chauffeur) =>
            chauffeur.firstName.toLowerCase().includes(query) ||
            chauffeur.lastName.toLowerCase().includes(query) ||
            chauffeur.email.toLowerCase().includes(query) ||
            chauffeur.licenseNumber.toLowerCase().includes(query) ||
            (chauffeur.phone && chauffeur.phone.toLowerCase().includes(query))
          );
        }

        setChauffeurs(filteredData);
      } catch (error) {
        console.error('Error fetching chauffeurs:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load chauffeurs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChauffeurs();
  }, [filterStatus, debouncedSearchQuery]);

  // Log selected chauffeur when it changes
  useEffect(() => {
    if (selectedChauffeur) {
      console.log("Selected chauffeur for editing:", selectedChauffeur);
    }
  }, [selectedChauffeur]);

  // Handle chauffeur creation/update
  const handleChauffeurSubmit = async (data: ChauffeurFormValues) => {
    try {
      // For now, simulate API call with mock data
      // In a real implementation, you would call the API

      // Simulate a delay to mimic API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (selectedChauffeur) {
        // Update existing chauffeur in the state
        setChauffeurs(prevChauffeurs =>
          prevChauffeurs.map(chauffeur =>
            chauffeur.id === selectedChauffeur.id
              ? {
                  ...chauffeur,
                  licenseNumber: data.licenseNumber,
                  licenseExpiry: data.licenseExpiry,
                  vtcCardNumber: data.vtcCardNumber,
                  vtcValidationDate: data.vtcValidationDate,
                  status: data.status,
                  category: data.category,
                  notes: data.notes,
                  vehicle: data.vehicleId
                    ? {
                        id: data.vehicleId,
                        name: data.vehicleId === "vehicle_1" ? "Mercedes S-Class" : "BMW 7 Series",
                        licensePlate: data.vehicleId === "vehicle_1" ? "ABC123" : "XYZ789",
                      }
                    : null,
                  updatedAt: new Date(),
                }
              : chauffeur
          )
        );
        toast.success('Chauffeur updated successfully');
      } else {
        // Create a new chauffeur and add it to the state
        const newChauffeur: Chauffeur = {
          id: `chauffeur_${Date.now()}`,
          userId: data.userId,
          firstName: data.userId === "user_1" ? "John" : data.userId === "user_2" ? "Jane" : "Michael",
          lastName: data.userId === "user_1" ? "Doe" : data.userId === "user_2" ? "Smith" : "Johnson",
          fullName: data.userId === "user_1" ? "John Doe" : data.userId === "user_2" ? "Jane Smith" : "Michael Johnson",
          email: data.userId === "user_1" ? "john.doe@example.com" : data.userId === "user_2" ? "jane.smith@example.com" : "michael.johnson@example.com",
          phone: data.userId === "user_1" ? "+1234567890" : data.userId === "user_2" ? "+0987654321" : "+1122334455",
          licenseNumber: data.licenseNumber,
          licenseExpiry: data.licenseExpiry,
          vtcCardNumber: data.vtcCardNumber,
          vtcValidationDate: data.vtcValidationDate,
          status: data.status,
          category: data.category,
          notes: data.notes,
          vehicle: data.vehicleId
            ? {
                id: data.vehicleId,
                name: data.vehicleId === "vehicle_1" ? "Mercedes S-Class" : "BMW 7 Series",
                licensePlate: data.vehicleId === "vehicle_1" ? "ABC123" : "XYZ789",
              }
            : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setChauffeurs(prevChauffeurs => [...prevChauffeurs, newChauffeur]);
        toast.success('Chauffeur created successfully');
      }

      setChauffeurDialogOpen(false);
      setSelectedChauffeur(null);
    } catch (error) {
      console.error('Error saving chauffeur:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Handle chauffeur deletion
  const handleDeleteChauffeur = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chauffeur?')) {
      return;
    }
    try {
      // For now, simulate API call with mock data
      // In a real implementation, you would call the API

      // Simulate a delay to mimic API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove the chauffeur from the state
      setChauffeurs(chauffeurs.filter(chauffeur => chauffeur.id !== id));

      toast.success('Chauffeur deleted successfully');
    } catch (error) {
      console.error('Error deleting chauffeur:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'BUSY':
        return 'bg-red-100 text-red-800';
      case 'ON_BREAK':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFF_DUTY':
        return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category badge color
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'HIGH_END':
        return 'bg-purple-100 text-purple-800';
      case 'BUSINESS':
        return 'bg-blue-100 text-blue-800';
      case 'ECONOMY':
        return 'bg-green-100 text-green-800';
      case 'AVERAGE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  // Format category for display
  const formatCategory = (category: string) => {
    return category.replace('_', ' ');
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
                    <h1 className="text-2xl font-bold tracking-tight">Chauffeurs</h1>
                    <p className="text-muted-foreground">
                      Manage all your chauffeurs and their assignments
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => {
                      setSelectedChauffeur(null);
                      setChauffeurDialogOpen(true);
                    }}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Chauffeur
                    </Button>
                    <ChauffeurDialog
                      open={chauffeurDialogOpen}
                      onOpenChange={setChauffeurDialogOpen}
                      onSubmit={handleChauffeurSubmit}
                      defaultValues={selectedChauffeur || undefined}
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
                        placeholder="Search chauffeurs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                        <DropdownMenuItem onClick={() => setFilterStatus("BUSY")}>Busy</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("ON_BREAK")}>On Break</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("OFF_DUTY")}>Off Duty</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("ON_LEAVE")}>On Leave</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="table" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">
                      {chauffeurs.length} chauffeurs found
                    </div>
                  </div>

                  {/* Table View */}
                  <TabsContent value="table" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>License & VTC</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                              </TableCell>
                            </TableRow>
                          ) : chauffeurs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                No chauffeurs found
                              </TableCell>
                            </TableRow>
                          ) : (
                            chauffeurs.map((chauffeur) => (
                              <TableRow key={chauffeur.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{getInitials(chauffeur.firstName, chauffeur.lastName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{chauffeur.firstName} {chauffeur.lastName}</div>
                                      <div className="text-xs text-muted-foreground">{chauffeur.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col space-y-1">
                                    <div>
                                      <span className="text-sm font-medium">License:</span>
                                      <span className="text-sm ml-1">{chauffeur.licenseNumber}</span>
                                      <span className="text-xs text-muted-foreground block">
                                        Expires: {format(new Date(chauffeur.licenseExpiry), "PP")}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">VTC Card:</span>
                                      <span className="text-sm ml-1">{chauffeur.vtcCardNumber}</span>
                                      <span className="text-xs text-muted-foreground block">
                                        Validated: {format(new Date(chauffeur.vtcValidationDate), "PP")}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {chauffeur.vehicle ? (
                                    <div className="flex items-center gap-1">
                                      <Car className="h-4 w-4 text-muted-foreground" />
                                      <span>{chauffeur.vehicle.name}</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">No vehicle</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn(getStatusBadgeClass(chauffeur.status))}>
                                    {formatStatus(chauffeur.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn(getCategoryBadgeClass(chauffeur.category))}>
                                    {formatCategory(chauffeur.category)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedChauffeur(chauffeur);
                                        setChauffeurDialogOpen(true);
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
                                      onClick={() => handleDeleteChauffeur(chauffeur.id)}
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
                      ) : chauffeurs.length === 0 ? (
                        <div className="flex justify-center items-center h-40">
                          <p className="text-muted-foreground">No chauffeurs found</p>
                        </div>
                      ) : (
                        chauffeurs.map((chauffeur) => (
                          <Card key={chauffeur.id} className="overflow-hidden">
                            <CardHeader className="p-4 pb-0">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback>{getInitials(chauffeur.firstName, chauffeur.lastName)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <CardTitle className="text-lg font-semibold">
                                      {chauffeur.firstName} {chauffeur.lastName}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-1">
                                      {chauffeur.email}
                                    </CardDescription>
                                  </div>
                                </div>
                                <Badge className={cn(getStatusBadgeClass(chauffeur.status))}>
                                  {formatStatus(chauffeur.status)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-3">
                              <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    License: {chauffeur.licenseNumber}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Expires: {format(new Date(chauffeur.licenseExpiry), "PPP")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4 mt-0.5 text-muted-foreground"
                                >
                                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">
                                    VTC Card: {chauffeur.vtcCardNumber}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Validated: {format(new Date(chauffeur.vtcValidationDate), "PPP")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Car className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <p className="text-sm line-clamp-1">
                                  {chauffeur.vehicle ? chauffeur.vehicle.name : "No vehicle assigned"}
                                </p>
                              </div>
                              {chauffeur.phone && (
                                <div className="flex items-start gap-2">
                                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <p className="text-sm">{chauffeur.phone}</p>
                                </div>
                              )}
                              <div className="flex items-start gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4 mt-0.5 text-muted-foreground"
                                >
                                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                  <line x1="7" y1="7" x2="7.01" y2="7" />
                                </svg>
                                <p className="text-sm">
                                  <Badge className={cn(getCategoryBadgeClass(chauffeur.category))}>
                                    {formatCategory(chauffeur.category)}
                                  </Badge>
                                </p>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedChauffeur(chauffeur);
                                  setChauffeurDialogOpen(true);
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
                                  className="mr-2 h-4 w-4"
                                >
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                                Edit
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteChauffeur(chauffeur.id)}
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
