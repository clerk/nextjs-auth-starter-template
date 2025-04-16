"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { clientFormSchema, type ClientFormValues } from "../schemas/client-schema"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2, Building2, Users, Calendar, MapPin, Phone, Mail, ExternalLink, Edit, ArrowLeft, FileText, Receipt, DollarSign } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

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
    role: string
  }[]
  events?: any[]
  bookings?: any[]
  // Bills and Estimates will be added when the schema is updated
  // bills?: {
  //   id: string
  //   number: string
  //   amount: number
  //   status: string
  //   dueDate: string
  //   issueDate: string
  //   description?: string
  // }[]
  // estimates?: {
  //   id: string
  //   number: string
  //   amount: number
  //   status: string
  //   validUntil: string
  //   issueDate: string
  //   description?: string
  // }[]
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string

  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showClientDialog, setShowClientDialog] = useState(false)
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
      sendInvitation: false
    }
  })

  // Fetch client details
  useEffect(() => {
    const fetchClientDetails = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/clients/${clientId}`)
        if (response.ok) {
          const data = await response.json()
          setClient(data)

          // Populate the form with client data
          const primaryContact = data.users && data.users.length > 0 ? data.users[0] : null

          form.reset({
            name: data.name,
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            country: data.country || "",
            postalCode: data.postalCode || "",
            website: data.website || "",
            active: data.active,
            contractStart: data.contractStart ? new Date(data.contractStart).toISOString().split('T')[0] : "",
            contractEnd: data.contractEnd ? new Date(data.contractEnd).toISOString().split('T')[0] : "",
            logoUrl: data.logoUrl || "",
            contactFirstName: primaryContact?.firstName || "",
            contactLastName: primaryContact?.lastName || "",
            contactEmail: primaryContact?.email || "",
            contactPhone: primaryContact?.phone || "",
            sendInvitation: false
          })
        } else {
          const error = await response.json()
          toast.error(error.error || "Failed to fetch client details")
        }
      } catch (error) {
        console.error("Error fetching client details:", error)
        toast.error("An error occurred while fetching client details")
      } finally {
        setIsLoading(false)
      }
    }

    if (clientId) {
      fetchClientDetails()
    }
  }, [clientId, form])

  // Handle form submission for updating client
  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true)

    try {
      // Update existing client
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const updatedClient = await response.json()
        setClient(updatedClient)
        setShowClientDialog(false)

        // Show appropriate success message
        if (client.users && client.users.length > 0) {
          toast.success("Client and contact information updated successfully")
        } else if (data.contactFirstName && data.contactLastName && data.contactEmail) {
          toast.success(
            "Client updated successfully. Contact information has been recorded and will be processed separately.",
            { duration: 5000 }
          )
        } else {
          toast.success("Client updated successfully")
        }

        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update client")
      }
    } catch (error) {
      console.error("Error updating client:", error)
      toast.error("An error occurred while updating the client")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading client details...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!client) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-muted-foreground">Client not found</p>
            <Button asChild className="mt-4">
              <Link href="/clients">Back to Clients</Link>
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header with back button */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center mb-4">
                  <Button variant="ghost" size="sm" asChild className="mr-2">
                    <Link href="/clients">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Clients
                    </Link>
                  </Button>
                </div>

                {/* Client header card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          {client.logoUrl ? (
                            <AvatarImage src={client.logoUrl} alt={client.name} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {client.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-2xl">{client.name}</CardTitle>
                            <Badge
                              variant={client.active ? "success" : "destructive"}
                              className={client.active
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900"
                                : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900"}
                            >
                              {client.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {client.website && (
                            <a
                              href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground flex items-center hover:underline"
                            >
                              {client.website}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowClientDialog(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Client
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                      {client.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Email:</span>
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Phone:</span>
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {(client.address || client.city || client.country) && (
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Address:</span>
                          <span>
                            {[
                              client.address,
                              client.city,
                              client.postalCode,
                              client.country
                            ].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">{client._count?.users || 0} users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium">{client._count?.bookings || 0} bookings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium">{client._count?.events || 0} events</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for different sections */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 w-full md:w-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    {/* Add these tabs when the schema is updated */}
                    {/* <TabsTrigger value="bills">Bills</TabsTrigger> */}
                    {/* <TabsTrigger value="estimates">Estimates</TabsTrigger> */}
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Client Overview</CardTitle>
                        <CardDescription>
                          Summary of client activity and information
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Recent Events */}
                          <div>
                            <h3 className="text-lg font-medium mb-2">Recent Events</h3>
                            {client.events && client.events.length > 0 ? (
                              <div className="space-y-2">
                                {client.events.slice(0, 3).map((event) => (
                                  <Card key={event.id} className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium">{event.title}</h4>
                                        <p className="text-sm text-muted-foreground">{event.startDate}</p>
                                      </div>
                                      <Badge>{event.status}</Badge>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No events found for this client.</p>
                            )}
                            {client._count?.events > 0 && (
                              <Button variant="link" size="sm" className="mt-2 p-0" onClick={() => setActiveTab("events")}>
                                View all events
                              </Button>
                            )}
                          </div>

                          <Separator />

                          {/* Recent Bookings */}
                          <div>
                            <h3 className="text-lg font-medium mb-2">Recent Bookings</h3>
                            {client.bookings && client.bookings.length > 0 ? (
                              <div className="space-y-2">
                                {client.bookings.slice(0, 3).map((booking) => (
                                  <Card key={booking.id} className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium">{booking.title || `Booking #${booking.id.substring(0, 8)}`}</h4>
                                        <p className="text-sm text-muted-foreground">{booking.date}</p>
                                      </div>
                                      <Badge>{booking.status}</Badge>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No bookings found for this client.</p>
                            )}
                            {client._count?.bookings > 0 && (
                              <Button variant="link" size="sm" className="mt-2 p-0" onClick={() => setActiveTab("bookings")}>
                                View all bookings
                              </Button>
                            )}
                          </div>

                          <Separator />

                          {/* Client Users */}
                          <div>
                            <h3 className="text-lg font-medium mb-2">Client Users</h3>
                            {client.users && client.users.length > 0 ? (
                              <div className="space-y-2">
                                {client.users.slice(0, 3).map((user) => (
                                  <Card key={user.id} className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                      </div>
                                      <Badge variant="outline">{user.role}</Badge>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No users found for this client.</p>
                            )}
                            {client._count?.users > 0 && (
                              <Button variant="link" size="sm" className="mt-2 p-0" onClick={() => setActiveTab("users")}>
                                View all users
                              </Button>
                            )}
                          </div>

                          {/* Bills and Estimates sections will be added when the schema is updated */}
                          {/* <Separator />

                          <!-- Recent Bills -->
                          <div>
                            <h3 className="text-lg font-medium mb-2">Recent Bills</h3>
                            {client.bills && client.bills.length > 0 ? (
                              <div className="space-y-2">
                                {client.bills.slice(0, 3).map((bill) => (
                                  <Card key={bill.id} className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium">Invoice #{bill.number}</h4>
                                        <p className="text-sm text-muted-foreground">Due: {bill.dueDate}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">${bill.amount.toFixed(2)}</span>
                                        <Badge
                                          variant={bill.status === "PAID" ? "success" : bill.status === "OVERDUE" ? "destructive" : "outline"}
                                          className={bill.status === "PAID"
                                            ? "bg-green-100 text-green-800"
                                            : bill.status === "OVERDUE"
                                              ? "bg-red-100 text-red-800"
                                              : ""}
                                        >
                                          {bill.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No bills found for this client.</p>
                            )}
                            {client._count?.bills > 0 && (
                              <Button variant="link" size="sm" className="mt-2 p-0" onClick={() => setActiveTab("bills")}>
                                View all bills
                              </Button>
                            )}
                          </div>

                          <Separator />

                          <!-- Recent Estimates -->
                          <div>
                            <h3 className="text-lg font-medium mb-2">Recent Estimates</h3>
                            {client.estimates && client.estimates.length > 0 ? (
                              <div className="space-y-2">
                                {client.estimates.slice(0, 3).map((estimate) => (
                                  <Card key={estimate.id} className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium">Estimate #{estimate.number}</h4>
                                        <p className="text-sm text-muted-foreground">Valid until: {estimate.validUntil}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">${estimate.amount.toFixed(2)}</span>
                                        <Badge
                                          variant={estimate.status === "ACCEPTED" ? "success" : estimate.status === "REJECTED" ? "destructive" : "outline"}
                                          className={estimate.status === "ACCEPTED"
                                            ? "bg-green-100 text-green-800"
                                            : estimate.status === "REJECTED"
                                              ? "bg-red-100 text-red-800"
                                              : ""}
                                        >
                                          {estimate.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No estimates found for this client.</p>
                            )}
                            {client._count?.estimates > 0 && (
                              <Button variant="link" size="sm" className="mt-2 p-0" onClick={() => setActiveTab("estimates")}>
                                View all estimates
                              </Button>
                            )}
                          </div> */}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Events Tab */}
                  <TabsContent value="events" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Client Events</CardTitle>
                          <CardDescription>
                            All events for {client.name}
                          </CardDescription>
                        </div>
                        <Button>
                          <Calendar className="mr-2 h-4 w-4" />
                          Create Event
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {client.events && client.events.length > 0 ? (
                          <div className="space-y-4">
                            {client.events.map((event) => (
                              <Card key={event.id} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-lg">{event.title}</h3>
                                    <p className="text-sm text-muted-foreground">{event.startDate} - {event.endDate}</p>
                                    {event.location && (
                                      <p className="text-sm flex items-center mt-1">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {event.location}
                                      </p>
                                    )}
                                  </div>
                                  <Badge>{event.status}</Badge>
                                </div>
                                {event.description && (
                                  <p className="text-sm mt-2">{event.description}</p>
                                )}
                                <div className="flex justify-end mt-4">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/events/${event.id}`}>View Details</Link>
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">No Events Yet</h3>
                            <p className="text-muted-foreground mb-4">This client doesn't have any events yet.</p>
                            <Button>Create First Event</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Bookings Tab */}
                  <TabsContent value="bookings" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Client Bookings</CardTitle>
                          <CardDescription>
                            All bookings for {client.name}
                          </CardDescription>
                        </div>
                        <Button>
                          <Calendar className="mr-2 h-4 w-4" />
                          Create Booking
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {client.bookings && client.bookings.length > 0 ? (
                          <div className="space-y-4">
                            {client.bookings.map((booking) => (
                              <Card key={booking.id} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-lg">{booking.title || `Booking #${booking.id.substring(0, 8)}`}</h3>
                                    <p className="text-sm text-muted-foreground">{booking.date}</p>
                                    {booking.pickupAddress && booking.dropoffAddress && (
                                      <p className="text-sm flex items-center mt-1">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {booking.pickupAddress} to {booking.dropoffAddress}
                                      </p>
                                    )}
                                  </div>
                                  <Badge>{booking.status}</Badge>
                                </div>
                                <div className="flex justify-end mt-4">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/bookings/${booking.id}`}>View Details</Link>
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">No Bookings Yet</h3>
                            <p className="text-muted-foreground mb-4">This client doesn't have any bookings yet.</p>
                            <Button>Create First Booking</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Users Tab */}
                  <TabsContent value="users" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Client Users</CardTitle>
                          <CardDescription>
                            All users associated with {client.name}
                          </CardDescription>
                        </div>
                        <Button>
                          <Users className="mr-2 h-4 w-4" />
                          Add User
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {client.users && client.users.length > 0 ? (
                          <div className="space-y-4">
                            {client.users.map((user) => (
                              <Card key={user.id} className="p-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                  </div>
                                  <Badge variant="outline">{user.role}</Badge>
                                </div>
                                {user.phone && (
                                  <div className="mt-2 text-sm flex items-center text-muted-foreground">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {user.phone}
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">No Users Yet</h3>
                            <p className="text-muted-foreground mb-4">This client doesn't have any users yet.</p>
                            <Button>Add First User</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Bills and Estimates tabs will be added when the schema is updated */}
                  {/* Bills Tab */}
                  {/* <TabsContent value="bills" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Client Bills</CardTitle>
                          <CardDescription>
                            All invoices for {client.name}
                          </CardDescription>
                        </div>
                        <Button>
                          <Receipt className="mr-2 h-4 w-4" />
                          Create Invoice
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {client.bills && client.bills.length > 0 ? (
                          <div className="space-y-4">
                            {client.bills.map((bill) => (
                              <Card key={bill.id} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-lg">Invoice #{bill.number}</h3>
                                      <Badge
                                        variant={bill.status === "PAID" ? "success" : bill.status === "OVERDUE" ? "destructive" : "outline"}
                                        className={bill.status === "PAID"
                                          ? "bg-green-100 text-green-800"
                                          : bill.status === "OVERDUE"
                                            ? "bg-red-100 text-red-800"
                                            : ""}
                                      >
                                        {bill.status}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-4 mt-1">
                                      <p className="text-sm text-muted-foreground">Issued: {bill.issueDate}</p>
                                      <p className="text-sm text-muted-foreground">Due: {bill.dueDate}</p>
                                    </div>
                                  </div>
                                  <div className="text-xl font-bold">${bill.amount.toFixed(2)}</div>
                                </div>
                                {bill.description && (
                                  <p className="text-sm mt-2 text-muted-foreground">{bill.description}</p>
                                )}
                                <div className="flex justify-end mt-4 gap-2">
                                  <Button variant="outline" size="sm">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View PDF
                                  </Button>
                                  {bill.status !== "PAID" && (
                                    <Button size="sm">
                                      <DollarSign className="mr-2 h-4 w-4" />
                                      Mark as Paid
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">No Bills Yet</h3>
                            <p className="text-muted-foreground mb-4">This client doesn't have any bills yet.</p>
                            <Button>
                              <Receipt className="mr-2 h-4 w-4" />
                              Create First Invoice
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent> */}

                  {/* Estimates Tab */}
                  {/* <TabsContent value="estimates" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Client Estimates</CardTitle>
                          <CardDescription>
                            All estimates for {client.name}
                          </CardDescription>
                        </div>
                        <Button>
                          <FileText className="mr-2 h-4 w-4" />
                          Create Estimate
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {client.estimates && client.estimates.length > 0 ? (
                          <div className="space-y-4">
                            {client.estimates.map((estimate) => (
                              <Card key={estimate.id} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-lg">Estimate #{estimate.number}</h3>
                                      <Badge
                                        variant={estimate.status === "ACCEPTED" ? "success" : estimate.status === "REJECTED" ? "destructive" : "outline"}
                                        className={estimate.status === "ACCEPTED"
                                          ? "bg-green-100 text-green-800"
                                          : estimate.status === "REJECTED"
                                            ? "bg-red-100 text-red-800"
                                            : ""}
                                      >
                                        {estimate.status}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-4 mt-1">
                                      <p className="text-sm text-muted-foreground">Issued: {estimate.issueDate}</p>
                                      <p className="text-sm text-muted-foreground">Valid until: {estimate.validUntil}</p>
                                    </div>
                                  </div>
                                  <div className="text-xl font-bold">${estimate.amount.toFixed(2)}</div>
                                </div>
                                {estimate.description && (
                                  <p className="text-sm mt-2 text-muted-foreground">{estimate.description}</p>
                                )}
                                <div className="flex justify-end mt-4 gap-2">
                                  <Button variant="outline" size="sm">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View PDF
                                  </Button>
                                  {estimate.status === "PENDING" && (
                                    <Button size="sm">
                                      <Receipt className="mr-2 h-4 w-4" />
                                      Convert to Invoice
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">No Estimates Yet</h3>
                            <p className="text-muted-foreground mb-4">This client doesn't have any estimates yet.</p>
                            <Button>
                              <FileText className="mr-2 h-4 w-4" />
                              Create First Estimate
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent> */}
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Client Edit Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto md:max-w-[600px] lg:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update the details for this client organization. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
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
                  {client.users && client.users.length > 0
                    ? "Update the primary contact information"
                    : "Add primary contact information. Note: A new user account will be created in a separate step."}
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
                      Updating...
                    </>
                  ) : (
                    "Update Client"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
