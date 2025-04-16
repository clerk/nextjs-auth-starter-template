"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { clientFormSchema, type ClientFormValues } from "./schemas/client-schema"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, SearchIcon, Loader2, Building2, Users, Calendar, MapPin, Phone, Mail, ExternalLink, MoreHorizontal, Eye } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode?: string
  website?: string
  logoUrl?: string
  active: boolean
  contractStart?: Date
  contractEnd?: Date
  createdAt: Date
  updatedAt: Date
  _count: {
    users: number
    bookings: number
    events: number
  }
  users?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }[]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500) // 500ms debounce delay
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentClientId, setCurrentClientId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      active: true,
      contractStart: "",
      contractEnd: "",
      logoUrl: "",
      contactFirstName: "",
      contactLastName: "",
      contactEmail: "",
      contactPhone: "",
      sendInvitation: true
    }
  })

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/clients${debouncedSearchQuery ? `?search=${encodeURIComponent(debouncedSearchQuery)}` : ""}`)
        // Using encodeURIComponent to properly encode search parameters
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        } else {
          toast.error("Failed to fetch clients")
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast.error("An error occurred while fetching clients")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [debouncedSearchQuery]) // Only fetch when the debounced search query changes

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // If the search query is already debounced (meaning it's the same as debouncedSearchQuery),
    // there's no need to do anything as the search has already been triggered
    // Otherwise, we can force the debounced value to update immediately
    if (searchQuery !== debouncedSearchQuery) {
      // This is a visual cue that the search is being processed
      setIsLoading(true)
    }
  }

  // Add active status toggle to form
  const toggleActive = (checked: boolean) => {
    form.setValue("active", checked)
  }

  // Open dialog for creating a new client
  const handleAddClient = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      active: true,
      contactFirstName: "",
      contactLastName: "",
      contactEmail: "",
      contactPhone: "",
      sendInvitation: true
    })
    setIsEditMode(false)
    setCurrentClientId(null)
    setShowClientDialog(true)
  }

  // Open dialog for editing an existing client
  const handleEditClient = async (clientId: string) => {
    // Open the dialog immediately with a loading state
    setCurrentClientId(clientId)
    setIsEditMode(true)
    setIsSubmitting(true) // Use isSubmitting to show loading state in the form
    setShowClientDialog(true)

    try {
      const response = await fetch(`/api/clients/${clientId}`)
      if (response.ok) {
        const client = await response.json()

        // Get the primary contact if available
        const primaryContact = client.users && client.users.length > 0 ? client.users[0] : null

        form.reset({
          name: client.name,
          email: client.email || "",
          phone: client.phone || "",
          address: client.address || "",
          city: client.city || "",
          country: client.country || "",
          postalCode: client.postalCode || "",
          website: client.website || "",
          active: client.active,
          contractStart: client.contractStart ? new Date(client.contractStart).toISOString().split('T')[0] : "",
          contractEnd: client.contractEnd ? new Date(client.contractEnd).toISOString().split('T')[0] : "",
          logoUrl: client.logoUrl || "",
          contactFirstName: primaryContact?.firstName || "",
          contactLastName: primaryContact?.lastName || "",
          contactEmail: primaryContact?.email || "",
          contactPhone: primaryContact?.phone || "",
          sendInvitation: false
        })
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to fetch client details")
        // Close the dialog if we couldn't fetch the client
        setShowClientDialog(false)
      }
    } catch (error) {
      console.error("Error fetching client details:", error)
      toast.error("An error occurred while fetching client details")
      // Close the dialog if there was an error
      setShowClientDialog(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle form submission (create or update)
  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true)

    try {
      if (isEditMode && currentClientId) {
        // Update existing client
        const response = await fetch(`/api/clients/${currentClientId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          const updatedClient = await response.json()
          setClients(prev => prev.map(client =>
            client.id === currentClientId ? updatedClient : client
          ))
          setShowClientDialog(false)
          toast.success("Client updated successfully")
        } else {
          const error = await response.json()
          toast.error(error.error || "Failed to update client")
        }
      } else {
        // Create new client
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          const createdClient = await response.json()
          setClients(prev => [...prev, createdClient])
          setShowClientDialog(false)
          toast.success("Client created successfully")
        } else {
          const error = await response.json()
          toast.error(error.error || "Failed to create client")
        }
      }
    } catch (error) {
      console.error("Error saving client:", error)
      toast.error("An error occurred while saving the client")
    } finally {
      setIsSubmitting(false)
    }
  }

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
                    <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground">
                      Manage your client organizations and their details
                    </p>
                  </div>
                  <Button onClick={handleAddClient}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Client
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                    <div className="relative w-full">
                      {isLoading && searchQuery !== debouncedSearchQuery ? (
                        <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      )}
                      <Input
                        type="search"
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8"
                        aria-label="Search clients"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isLoading && searchQuery !== debouncedSearchQuery}
                    >
                      {isLoading && searchQuery !== debouncedSearchQuery ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </form>
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
                        <DropdownMenuItem onClick={() => setSearchQuery("")}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSearchQuery("active:true")}>Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSearchQuery("active:false")}>Inactive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="table" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                  </TabsList>

                  {/* Table View */}
                  <TabsContent value="table" className="space-y-4">
                    <Card>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-280px)]">
                          {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : clients.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              No clients found. Add a new client to get started.
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Client</TableHead>
                                  <TableHead>Contact</TableHead>
                                  <TableHead>Location</TableHead>
                                  <TableHead className="text-center">Users</TableHead>
                                  <TableHead className="text-center">Bookings</TableHead>
                                  <TableHead className="text-center">Events</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {clients.map((client) => (
                                  <TableRow key={client.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                          {client.logoUrl ? (
                                            <AvatarImage src={client.logoUrl} alt={client.name} />
                                          ) : null}
                                          <AvatarFallback className="bg-primary/10 text-primary">
                                            {client.name.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <a
                                          href={`/clients/${client.id}`}
                                          className="font-medium hover:underline hover:text-primary transition-colors"
                                        >
                                          {client.name}
                                        </a>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-col gap-1">
                                        {client.email && (
                                          <div className="flex items-center text-sm text-muted-foreground">
                                            <Mail className="mr-1 h-3 w-3" />
                                            <span>{client.email}</span>
                                          </div>
                                        )}
                                        {client.phone && (
                                          <div className="flex items-center text-sm text-muted-foreground">
                                            <Phone className="mr-1 h-3 w-3" />
                                            <span>{client.phone}</span>
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {(client.city || client.country) && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <MapPin className="mr-1 h-3 w-3" />
                                          <span>
                                            {client.city && client.country
                                              ? `${client.city}, ${client.country}`
                                              : client.city || client.country}
                                          </span>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-950">
                                        {client._count?.users || 0}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-950">
                                        {client._count?.bookings || 0}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-950">
                                        {client._count?.events || 0}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={client.active ? "success" : "destructive"}
                                        className={client.active
                                          ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900"
                                          : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900"}
                                      >
                                        {client.active ? "Active" : "Inactive"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end items-center space-x-2">
                                        <Button variant="ghost" size="icon" asChild>
                                          <a href={`/clients/${client.id}`} title="View client details">
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View client</span>
                                          </a>
                                        </Button>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <MoreHorizontal className="h-4 w-4" />
                                              <span className="sr-only">Open menu</span>
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                              <a href={`/clients/${client.id}`}>View details</a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleEditClient(client.id)}>
                                              Edit client
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                              Delete client
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Grid View */}
                  <TabsContent value="grid" className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No clients found. Add a new client to get started.
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {clients.map((client) => (
                          <Card key={client.id} className="overflow-hidden">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    {client.logoUrl ? (
                                      <AvatarImage src={client.logoUrl} alt={client.name} />
                                    ) : null}
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {client.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <CardTitle className="text-base">
                                      <a
                                        href={`/clients/${client.id}`}
                                        className="hover:underline hover:text-primary transition-colors"
                                      >
                                        {client.name}
                                      </a>
                                    </CardTitle>
                                    {client.website && (
                                      <a
                                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground flex items-center hover:underline"
                                      >
                                        {client.website}
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  variant={client.active ? "success" : "destructive"}
                                  className={client.active
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900"
                                    : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900"}
                                >
                                  {client.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <div className="flex flex-col gap-2">
                                {(client.city || client.country) && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>
                                      {client.city && client.country
                                        ? `${client.city}, ${client.country}`
                                        : client.city || client.country}
                                    </span>
                                  </div>
                                )}
                                {client.email && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>{client.email}</span>
                                  </div>
                                )}
                                {client.phone && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Phone className="mr-2 h-4 w-4" />
                                    <span>{client.phone}</span>
                                  </div>
                                )}
                              </div>

                              <Separator className="my-3" />

                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{client._count?.users || 0} users</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm">{client._count?.bookings || 0} bookings</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-amber-600" />
                                  <span className="text-sm">{client._count?.events || 0} events</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={`/clients/${client.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </a>
                                </Button>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onSelect={() => handleEditClient(client.id)}>Edit client</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    Delete client
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Client Dialog (Add/Edit) */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto md:max-w-[600px] lg:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the details for this client organization."
                : "Enter the details for the new client organization."} Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {isSubmitting && isEditMode ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading client details...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="www.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                <h3 className="text-sm font-medium">Organization Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                <h3 className="text-sm font-medium">Primary Contact Person</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {isEditMode
                    ? "Update the primary contact information"
                    : "This person will receive an invitation to create an account"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isEditMode && (
                  <FormField
                    control={form.control}
                    name="sendInvitation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Send invitation email to create an account
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <Separator />
                <h3 className="text-sm font-medium">Contract Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Active client
                        </FormLabel>
                        <FormDescription>
                          Inactive clients won't appear in dropdown menus for new bookings
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Separator />
                <h3 className="text-sm font-medium">Address</h3>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Business St." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                <h3 className="text-sm font-medium">Contract Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Active client
                        </FormLabel>
                        <FormDescription>
                          Inactive clients won't appear in dropdown menus for new bookings
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowClientDialog(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEditMode ? "Update Client" : "Create Client"
                  )}
                </Button>
              </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}


