"use client"

import { useState, useEffect } from "react"
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
import { PlusIcon, SearchIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  active: boolean
  _count: {
    users: number
    bookings: number
    events: number
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: ""
  })

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/clients${searchQuery ? `?search=${searchQuery}` : ""}`)
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
  }, [searchQuery])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is triggered by the searchQuery state change
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewClient(prev => ({ ...prev, [name]: value }))
  }

  // Handle client creation
  const handleCreateClient = async () => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newClient)
      })

      if (response.ok) {
        const createdClient = await response.json()
        setClients(prev => [...prev, createdClient])
        setShowAddDialog(false)
        setNewClient({
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          country: ""
        })
        toast.success("Client created successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create client")
      }
    } catch (error) {
      console.error("Error creating client:", error)
      toast.error("An error occurred while creating the client")
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Clients</h1>
              <Button onClick={() => setShowAddDialog(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  View and manage your clients. Add new clients, edit existing ones, or search for specific clients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2 mb-4">
                  <Input
                    type="search"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </form>

                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Clients</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4">
                    {renderClientsTable(clients, isLoading)}
                  </TabsContent>
                  <TabsContent value="active" className="mt-4">
                    {renderClientsTable(clients.filter(client => client.active), isLoading)}
                  </TabsContent>
                  <TabsContent value="inactive" className="mt-4">
                    {renderClientsTable(clients.filter(client => !client.active), isLoading)}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </main>
          <SidebarInset />
        </div>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the details for the new client. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={newClient.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newClient.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={newClient.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={newClient.address}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input
                id="city"
                name="city"
                value={newClient.city}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                value={newClient.country}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateClient}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

function renderClientsTable(clients: Client[], isLoading: boolean) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No clients found. Add a new client to get started.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Users</TableHead>
          <TableHead>Bookings</TableHead>
          <TableHead>Events</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.email || "-"}</TableCell>
            <TableCell>{client.phone || "-"}</TableCell>
            <TableCell>
              {client.city && client.country
                ? `${client.city}, ${client.country}`
                : client.city || client.country || "-"}
            </TableCell>
            <TableCell>{client._count.users}</TableCell>
            <TableCell>{client._count.bookings}</TableCell>
            <TableCell>{client._count.events}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  client.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {client.active ? "Active" : "Inactive"}
              </span>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" asChild>
                <a href={`/clients/${client.id}`}>View</a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
