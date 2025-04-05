"use client"

import { useState } from "react"
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
import {
  BuildingIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
  CarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for organizations
const organizations = [
  {
    id: "1",
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    city: "New York",
    country: "USA",
    active: true,
    usersCount: 24,
    bookingsCount: 156,
    contractStart: "2023-01-01",
    contractEnd: "2024-12-31",
  },
  {
    id: "2",
    name: "Globex Industries",
    email: "info@globex.com",
    phone: "+1 (555) 987-6543",
    address: "456 Park Ave, Chicago, IL 60601",
    city: "Chicago",
    country: "USA",
    active: true,
    usersCount: 18,
    bookingsCount: 89,
    contractStart: "2023-03-15",
    contractEnd: "2025-03-14",
  },
  {
    id: "3",
    name: "Umbrella Corp",
    email: "contact@umbrella.com",
    phone: "+1 (555) 456-7890",
    address: "789 Oak St, Los Angeles, CA 90001",
    city: "Los Angeles",
    country: "USA",
    active: false,
    usersCount: 12,
    bookingsCount: 45,
    contractStart: "2022-06-01",
    contractEnd: "2023-12-31",
  },
  {
    id: "4",
    name: "Stark Industries",
    email: "info@stark.com",
    phone: "+1 (555) 789-0123",
    address: "1 Stark Tower, Manhattan, NY 10001",
    city: "New York",
    country: "USA",
    active: true,
    usersCount: 35,
    bookingsCount: 210,
    contractStart: "2023-02-15",
    contractEnd: "2026-02-14",
  },
  {
    id: "5",
    name: "Wayne Enterprises",
    email: "contact@wayne.com",
    phone: "+1 (555) 234-5678",
    address: "1 Wayne Tower, Gotham City, NJ 08001",
    city: "Gotham",
    country: "USA",
    active: true,
    usersCount: 28,
    bookingsCount: 175,
    contractStart: "2022-11-01",
    contractEnd: "2025-10-31",
  },
]

// Stats calculation
const totalOrganizations = organizations.length
const activeOrganizations = organizations.filter(org => org.active).length
const totalUsers = organizations.reduce((sum, org) => sum + org.usersCount, 0)
const totalBookings = organizations.reduce((sum, org) => sum + org.bookingsCount, 0)

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null)

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                    <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">
                      Manage all organizations and their settings
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Add New Organization</DialogTitle>
                        <DialogDescription>
                          Fill in the details to create a new organization.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input id="name" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input id="email" type="email" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Phone
                          </Label>
                          <Input id="phone" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="address" className="text-right">
                            Address
                          </Label>
                          <Input id="address" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="city" className="text-right">
                            City
                          </Label>
                          <Input id="city" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="country" className="text-right">
                            Country
                          </Label>
                          <Input id="country" className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Organization</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Organizations
                    </CardTitle>
                    <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrganizations}</div>
                    <p className="text-xs text-muted-foreground">
                      {activeOrganizations} active organizations
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      Across all organizations
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Bookings
                    </CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      From all organizations
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Rate
                    </CardTitle>
                    <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((activeOrganizations / totalOrganizations) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Of organizations are active
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Table */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="all" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="all">All Organizations</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                    <div className="relative w-64">
                      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search organizations..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <TabsContent value="all" className="mt-0">
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Users</TableHead>
                              <TableHead>Contract</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredOrganizations.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                  No organizations found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredOrganizations.map((org) => (
                                <TableRow key={org.id}>
                                  <TableCell className="font-medium">{org.name}</TableCell>
                                  <TableCell>{org.email}</TableCell>
                                  <TableCell>{`${org.city}, ${org.country}`}</TableCell>
                                  <TableCell>
                                    {org.active ? (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Active
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        Inactive
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>{org.usersCount}</TableCell>
                                  <TableCell>
                                    {new Date(org.contractEnd) < new Date() ? (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        Expired
                                      </Badge>
                                    ) : (
                                      <span className="text-sm">
                                        Until {new Date(org.contractEnd).toLocaleDateString()}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrganization(org)}>
                                        <EyeIcon className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                        <PencilIcon className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                        <TrashIcon className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="active" className="mt-0">
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Users</TableHead>
                              <TableHead>Contract</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredOrganizations.filter(org => org.active).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                  No active organizations found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredOrganizations
                                .filter(org => org.active)
                                .map((org) => (
                                  <TableRow key={org.id}>
                                    <TableCell className="font-medium">{org.name}</TableCell>
                                    <TableCell>{org.email}</TableCell>
                                    <TableCell>{`${org.city}, ${org.country}`}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Active
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{org.usersCount}</TableCell>
                                    <TableCell>
                                      {new Date(org.contractEnd) < new Date() ? (
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                          Expired
                                        </Badge>
                                      ) : (
                                        <span className="text-sm">
                                          Until {new Date(org.contractEnd).toLocaleDateString()}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrganization(org)}>
                                          <EyeIcon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                          <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                          <TrashIcon className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="inactive" className="mt-0">
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Users</TableHead>
                              <TableHead>Contract</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredOrganizations.filter(org => !org.active).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                  No inactive organizations found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredOrganizations
                                .filter(org => !org.active)
                                .map((org) => (
                                  <TableRow key={org.id}>
                                    <TableCell className="font-medium">{org.name}</TableCell>
                                    <TableCell>{org.email}</TableCell>
                                    <TableCell>{`${org.city}, ${org.country}`}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        Inactive
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{org.usersCount}</TableCell>
                                    <TableCell>
                                      {new Date(org.contractEnd) < new Date() ? (
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                          Expired
                                        </Badge>
                                      ) : (
                                        <span className="text-sm">
                                          Until {new Date(org.contractEnd).toLocaleDateString()}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrganization(org)}>
                                          <EyeIcon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                          <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                          <TrashIcon className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Organization Details Dialog */}
              {selectedOrganization && (
                <Dialog open={!!selectedOrganization} onOpenChange={() => setSelectedOrganization(null)}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{selectedOrganization.name}</DialogTitle>
                      <DialogDescription>
                        Organization details and information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Information</h3>
                          <div className="space-y-2">
                            <p><span className="font-medium">Email:</span> {selectedOrganization.email}</p>
                            <p><span className="font-medium">Phone:</span> {selectedOrganization.phone}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                          <div className="space-y-2">
                            <p>{selectedOrganization.address}</p>
                            <p>{selectedOrganization.city}, {selectedOrganization.country}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Contract Period</h3>
                          <div className="space-y-2">
                            <p><span className="font-medium">Start:</span> {new Date(selectedOrganization.contractStart).toLocaleDateString()}</p>
                            <p><span className="font-medium">End:</span> {new Date(selectedOrganization.contractEnd).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Statistics</h3>
                          <div className="space-y-2">
                            <p><span className="font-medium">Users:</span> {selectedOrganization.usersCount}</p>
                            <p><span className="font-medium">Bookings:</span> {selectedOrganization.bookingsCount}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                        <div>
                          {selectedOrganization.active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setSelectedOrganization(null)}>
                        Close
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant={selectedOrganization.active ? "destructive" : "default"}>
                          {selectedOrganization.active ? (
                            <>
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
