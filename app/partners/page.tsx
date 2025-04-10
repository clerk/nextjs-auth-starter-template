"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { partnerFormSchema, type PartnerFormValues } from "./schemas/partner-schema";
import { useDebounce } from "@/lib/hooks/use-debounce";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { PartnerDialog } from "./components/partner-dialog";
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  ExternalLinkIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Partner type definition
interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  logoUrl?: string;
  type: "INTERNAL" | "EXTERNAL" | "AFFILIATE";
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
  notes?: string;
  balance: number;
  ratePerKm?: number;
  ratePerHour?: number;
  minimumFare?: number;
  commissionRate?: number;
  paymentTerms?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    eventParticipations: number;
    missionPartners: number;
    ridePartners: number;
  };
}

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      logoUrl: "",
      type: "EXTERNAL",
      status: "ACTIVE",
      notes: "",
      balance: "",
      ratePerKm: "",
      ratePerHour: "",
      minimumFare: "",
      commissionRate: "",
      paymentTerms: "",
      bankName: "",
      bankAccountNumber: "",
      bankRoutingNumber: "",
      taxId: "",
    },
  });

  // Fetch partners from API
  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      let url = "/api/partners";
      if (activeTab !== "all") {
        url += `?active=${activeTab === "active"}`;
      }
      if (debouncedSearchQuery) {
        url += `${url.includes("?") ? "&" : "?"}search=${debouncedSearchQuery}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch partners");
      }

      const data = await response.json();
      setPartners(data);
      setFilteredPartners(data);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Failed to load partners");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch partners when tab or search query changes
  useEffect(() => {
    fetchPartners();
  }, [activeTab, debouncedSearchQuery]);

  // Open dialog for creating a new partner
  const handleAddPartner = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      logoUrl: "",
      type: "EXTERNAL",
      status: "ACTIVE",
      notes: "",
      balance: "",
      ratePerKm: "",
      ratePerHour: "",
      minimumFare: "",
      commissionRate: "",
      paymentTerms: "",
      bankName: "",
      bankAccountNumber: "",
      bankRoutingNumber: "",
      taxId: "",
    });
    setIsEditMode(false);
    setCurrentPartnerId(null);
    setShowPartnerDialog(true);
  };

  // Open dialog for editing an existing partner
  const handleEditPartner = async (partnerId: string) => {
    // Open the dialog immediately with a loading state
    setCurrentPartnerId(partnerId);
    setIsEditMode(true);
    setIsSubmitting(true);
    setShowPartnerDialog(true);

    try {
      const response = await fetch(`/api/partners/${partnerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch partner details");
      }

      const partnerData = await response.json();

      // Convert numeric values to strings for the form
      const formData = {
        ...partnerData,
        balance: partnerData.balance?.toString() || "",
        ratePerKm: partnerData.ratePerKm?.toString() || "",
        ratePerHour: partnerData.ratePerHour?.toString() || "",
        minimumFare: partnerData.minimumFare?.toString() || "",
        commissionRate: partnerData.commissionRate?.toString() || "",
      };

      form.reset(formData);
    } catch (error) {
      console.error("Error fetching partner details:", error);
      toast.error("Failed to load partner details");
      setShowPartnerDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle partner form submission
  const handleSubmitPartner = async (data: PartnerFormValues) => {
    setIsSubmitting(true);
    try {
      // Note: For existing partners, we still collect all the data
      // The partnerId will be used later by a webhook to fetch additional data

      // Otherwise proceed with normal create/update
      const url = isEditMode && currentPartnerId
        ? `/api/partners/${currentPartnerId}`
        : "/api/partners";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save partner");
      }

      const savedPartner = await response.json();

      toast.success(
        isEditMode
          ? `Partner "${savedPartner.name}" updated successfully`
          : `Partner "${savedPartner.name}" created successfully`
      );

      setShowPartnerDialog(false);
      fetchPartners();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save partner");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle partner deletion
  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;

    try {
      const response = await fetch(`/api/partners/${partnerToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete partner");
      }

      toast.success(`Partner "${partnerToDelete.name}" deleted successfully`);
      setShowDeleteDialog(false);
      setPartnerToDelete(null);
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete partner");
    }
  };

  // Confirm partner deletion
  const confirmDeletePartner = (partner: Partner) => {
    setPartnerToDelete(partner);
    setShowDeleteDialog(true);
  };

  // Navigate to partner detail page
  const navigateToPartnerDetail = (partnerId: string) => {
    router.push(`/partners/${partnerId}`);
  };

  // Get partner type badge color
  const getPartnerTypeBadge = (type: string) => {
    switch (type) {
      case "INTERNAL":
        return <Badge variant="default">Internal</Badge>;
      case "EXTERNAL":
        return <Badge variant="outline">External</Badge>;
      case "AFFILIATE":
        return <Badge variant="secondary">Affiliate</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get partner status badge color
  const getPartnerStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get partner avatar
  const getPartnerAvatar = (partner: Partner) => {
    if (partner.logoUrl) {
      return (
        <Avatar>
          <AvatarImage src={partner.logoUrl} alt={partner.name} />
          <AvatarFallback>{partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      );
    }

    return (
      <Avatar>
        <AvatarFallback>{partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    );
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
                    <h1 className="text-2xl font-bold tracking-tight">Partners</h1>
                    <p className="text-muted-foreground">
                      Manage your partner organizations and their details
                    </p>
                  </div>
                  <Button onClick={handleAddPartner}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Partner
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full max-w-sm">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search partners..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Tabs
                    defaultValue="all"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Partners Table */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Partner</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              <div className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading partners...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredPartners.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              No partners found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPartners.map((partner) => (
                            <TableRow key={partner.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {getPartnerAvatar(partner)}
                                  <div>
                                    <div
                                      className="font-medium hover:underline cursor-pointer"
                                      onClick={() => navigateToPartnerDetail(partner.id)}
                                    >
                                      {partner.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {partner.city && partner.country
                                        ? `${partner.city}, ${partner.country}`
                                        : partner.city || partner.country || "No location"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getPartnerTypeBadge(partner.type)}</TableCell>
                              <TableCell>{getPartnerStatusBadge(partner.status)}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{partner.email}</div>
                                  <div className="text-muted-foreground">
                                    {partner.phone || "No phone"}
                                  </div>
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
                                      onClick={() => navigateToPartnerDetail(partner.id)}
                                    >
                                      <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleEditPartner(partner.id)}
                                    >
                                      <EditIcon className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => confirmDeletePartner(partner)}
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
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Partner Dialog */}
      <PartnerDialog
        open={showPartnerDialog}
        onOpenChange={setShowPartnerDialog}
        onSubmit={handleSubmitPartner}
        defaultValues={form.getValues()}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {partnerToDelete && partnerToDelete._count &&
                (partnerToDelete._count.eventParticipations > 0 ||
                partnerToDelete._count.missionPartners > 0 ||
                partnerToDelete._count.ridePartners > 0) ? (
                <span className="text-destructive">
                  This partner has associated events, missions, or rides. Consider setting the status to inactive instead of deleting.
                </span>
              ) : (
                "This action cannot be undone. This will permanently delete the partner from the system."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePartner}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
