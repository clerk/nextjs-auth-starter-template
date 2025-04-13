"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  MapPinIcon, 
  ClockIcon, 
  CarIcon, 
  UserIcon, 
  Building2, 
  Calendar, 
  CreditCard,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ride } from "@/components/rides/rides-list"

// Mock data for a single ride (in a real app, this would come from an API)
const mockRide: Ride = {
  id: "1",
  rideNumber: "RD-001",
  passengerName: "John Doe",
  chauffeurName: "Michael Smith",
  pickupAddress: "123 Main St, New York, NY",
  dropoffAddress: "456 Park Ave, New York, NY",
  pickupTime: "2023-05-15T10:30:00Z",
  status: "SCHEDULED",
  category: "CITY_TRANSFER",
  fare: 75.00,
  distance: 5.2,
  duration: 25,
  createdAt: "2023-05-14T14:30:00Z",
}

export default function RideDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ride, setRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the ride data from an API
    // For now, we'll use the mock data
    const fetchRide = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // In a real app, you would fetch the ride with the ID from params.rideId
        setRide(mockRide)
      } catch (error) {
        console.error("Error fetching ride:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRide()
  }, [params.rideId])

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'CITY_TRANSFER': return 'City Transfer'
      case 'AIRPORT_TRANSFER': return 'Airport Transfer'
      case 'TRAIN_STATION_TRANSFER': return 'Train Station Transfer'
      case 'CHAUFFEUR_SERVICE': return 'Chauffeur Service'
      default: return category.replace('_', ' ')
    }
  }

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
                  <h1 className="text-2xl font-bold">Loading ride details...</h1>
                </div>
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!ride) {
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
                  <h1 className="text-2xl font-bold">Ride not found</h1>
                </div>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-60">
                    <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">The requested ride could not be found.</p>
                    <Button onClick={() => router.push('/rides')} className="mt-4">
                      Go to Rides
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {/* Header with back button */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">Ride {ride.rideNumber}</h1>
                    <p className="text-muted-foreground">Created on {formatDate(ride.createdAt)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Ride details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main info card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Ride Details</CardTitle>
                      <Badge className={getStatusColor(ride.status)}>
                        {ride.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{getCategoryDisplayName(ride.category)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Pickup</h3>
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{ride.pickupAddress}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(ride.pickupTime)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Dropoff</h3>
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                            <p className="font-medium">{ride.dropoffAddress}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-muted-foreground">Distance</h3>
                          <div className="flex items-center gap-2">
                            <CarIcon className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{ride.distance} km</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{ride.duration} minutes</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-muted-foreground">Fare</h3>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">€{ride.fare.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar info card */}
                <Card>
                  <CardHeader>
                    <CardTitle>People</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Passenger</h3>
                      <div className="flex items-start gap-2">
                        <UserIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="font-medium">{ride.passengerName}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Chauffeur</h3>
                      <div className="flex items-start gap-2">
                        <UserIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="font-medium">{ride.chauffeurName}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="font-medium">Acme Corporation</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Event</h3>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="font-medium">Annual Conference 2023</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for additional information */}
              <Tabs defaultValue="timeline" className="mt-4">
                <TabsList>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="timeline" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ride Timeline</CardTitle>
                      <CardDescription>Track the progress of this ride</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="w-0.5 h-12 bg-muted-foreground/20"></div>
                          </div>
                          <div>
                            <h3 className="font-medium">Ride Created</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(ride.createdAt)}</p>
                            <p className="text-sm mt-1">Ride was created and scheduled</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="w-0.5 h-12 bg-muted-foreground/20"></div>
                          </div>
                          <div>
                            <h3 className="font-medium">Chauffeur Assigned</h3>
                            <p className="text-sm text-muted-foreground">May 14, 2023, 3:15 PM</p>
                            <p className="text-sm mt-1">Michael Smith was assigned to this ride</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">Pickup Time</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(ride.pickupTime)}</p>
                            <p className="text-sm mt-1">Scheduled pickup time</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="notes" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                      <CardDescription>Additional information about this ride</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">No notes available for this ride.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="documents" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Documents</CardTitle>
                      <CardDescription>Related documents for this ride</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">No documents available for this ride.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
