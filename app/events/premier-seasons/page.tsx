"use client"

import { useState } from "react"
import { PremierSeasonCard } from "@/components/premier-seasons/premier-season-card"
import { PremierSeasonDialog } from "@/components/premier-seasons/premier-season-dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import type { PremierSeason } from "@/types/premier-season"

export default function PremierSeasonsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()

  // This would come from your data store in a real app
  const mockPremierSeasons: PremierSeason[] = [
    {
      id: "1",
      title: "FIFA World Cup 2026",
      category: "GLOBAL_SPORTS",
      startDate: new Date(2026, 5, 10),
      endDate: new Date(2026, 6, 10),
      status: "UPCOMING",
      description: "2026 FIFA World Cup in North America",
      serviceTier: "ULTRA",
      location: "Multiple Cities, USA",
      expectedAttendance: 1200000,
      serviceTierMultiplier: 2.0,
      exclusiveService: true,
      fleetReserveRatio: 0.3,
      servicePriority: 1
    },
    // Add more mock data as needed
  ]

  const filteredSeasons = selectedCategory === "all" 
    ? mockPremierSeasons
    : mockPremierSeasons.filter(season => season.category === selectedCategory)

  const handleCreateSeason = async (data: PremierSeason) => {
    try {
      // Here you would typically make an API call to create the season
      console.log("Creating season:", data)
      toast({
        title: "Success",
        description: "Premier season created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create premier season",
        variant: "destructive",
      })
    }
  }

  const handleEditSeason = async (data: PremierSeason) => {
    try {
      // Here you would typically make an API call to update the season
      console.log("Updating season:", data)
      toast({
        title: "Success",
        description: "Premier season updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update premier season",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Premier Seasons</h1>
          <p className="text-muted-foreground">
            Manage high-profile event seasons and service tiers
          </p>
        </div>
        <PremierSeasonDialog 
          mode="create"
          onSubmit={handleCreateSeason}
        />
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Seasons</TabsTrigger>
          <TabsTrigger value="GLOBAL_SPORTS">Sports</TabsTrigger>
          <TabsTrigger value="CULTURAL_EVENTS">Cultural</TabsTrigger>
          <TabsTrigger value="BUSINESS_EVENTS">Business</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSeasons.map((season) => (
              <PremierSeasonCard
                key={season.id}
                season={season}
                onSelect={(season) => {
                  // Open edit dialog when card is selected
                  <PremierSeasonDialog 
                    mode="edit"
                    season={season}
                    onSubmit={handleEditSeason}
                  />
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
