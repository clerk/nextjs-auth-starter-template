"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPinIcon, ClockIcon, CarIcon, UserIcon, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Define the Ride type
export interface Ride {
  id: string
  rideNumber: string
  passengerName: string
  chauffeurName: string
  pickupAddress: string
  dropoffAddress: string
  pickupTime: string
  status: string
  category: string
  fare: number
  distance: number
  duration: number
  createdAt: string
}

interface RidesListProps {
  rides: Ride[]
  title?: string
  description?: string
  showSearch?: boolean
  limit?: number
}

export function RidesList({ 
  rides, 
  title = "Latest Rides", 
  description = "View and manage your recent rides",
  showSearch = true,
  limit
}: RidesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Filter rides based on search term
  const filteredRides = rides.filter(ride =>
    ride.rideNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ride.chauffeurName && ride.chauffeurName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ride.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.dropoffAddress.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Apply limit if specified
  const displayRides = limit ? filteredRides.slice(0, limit) : filteredRides

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        {showSearch && (
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search rides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Rides Grid */}
      {displayRides.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No rides found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayRides.map((ride) => (
            <Card key={ride.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ride.rideNumber}</CardTitle>
                    <CardDescription>{getCategoryDisplayName(ride.category)}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(ride.status)}>
                    {ride.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <UserIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{ride.passengerName}</p>
                      <p className="text-xs text-muted-foreground">Chauffeur: {ride.chauffeurName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">From: {ride.pickupAddress}</p>
                      <p className="text-sm font-medium">To: {ride.dropoffAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(ride.pickupTime)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CarIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{ride.distance} km • {ride.duration} min • €{ride.fare.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/rides/${ride.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
