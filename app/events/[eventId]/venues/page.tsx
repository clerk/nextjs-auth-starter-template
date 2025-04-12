"use client";

import { useState, useEffect } from 'react';
import { MapPin, Users } from "lucide-react"; // Assuming ResourceGrid might need these or for potential detail views

// Import UI Components (ensure these paths are correct for your project)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // If ResourceGrid doesn't render cards itself
import { Badge } from "@/components/ui/badge"; // If ResourceGrid uses badges
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Corrected import source for TabsTrigger
import { ResourceGrid } from "@/components/resource-grid"; // Assuming this component exists

// Define the Venue type (needed for state and props)
interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  imageUrl?: string;
  // Add any other properties ResourceGrid might need, e.g., status: 'available' | 'booked'
  status?: 'available' | 'booked' | 'assigned';
}

// Renamed params to use eventId consistently
export default function EventVenuesPage({ params }: { params: { eventId: string } }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true); // Start loading
      setError(null); // Reset error on new fetch
      try {
        // Use the eventId from params in the API call
        const response = await fetch(`/api/events/${params.eventId}/venues`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Add basic validation if needed: Array.isArray(data) etc.
        setVenues(data as Venue[]); // Assuming the API returns Venue[]
      } catch (error) {
        console.error('Error fetching venues:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch venues');
      } finally {
        setIsLoading(false); // End loading regardless of success or error
      }
    };

    if (params.eventId) {
       fetchVenues();
    } else {
      // Handle case where eventId might be missing, if applicable
      setError("Event ID is missing.");
      setIsLoading(false);
      setVenues([]);
    }

    // Dependency array includes params.eventId to refetch if it changes
  }, [params.eventId]);

  // Handler for drag start (implement actual logic)
  const handleDragStart = (item: Venue) => {
    console.log('Dragging venue:', item);
    // Example: event.dataTransfer.setData('application/json', JSON.stringify(item));
    // Add actual drag-and-drop data transfer logic here
  };

  // --- UI Rendering ---

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <p className="text-muted-foreground">Loading venues...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-6 text-destructive">
        <p>Error: {error}</p>
      </div>
    );
  }

  // Main content rendering
  return (
    <div className="flex h-full">
      {/* Left Sidebar - Resource Selection */}
      <div className="w-80 border-r p-4 bg-background overflow-y-auto"> {/* Added overflow-y-auto */}
         <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-semibold">Resources</h2>
             {/* Add Venue button could go here or elsewhere */}
             {/* <Button size="sm">Add Venue</Button> */}
         </div>
        <Tabs defaultValue="venues">
          <TabsList className="w-full grid grid-cols-3"> {/* Use grid for equal width */}
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="vehicles" disabled>Vehicles</TabsTrigger> {/* Example: Disable unimplemented tabs */}
            <TabsTrigger value="teams" disabled>Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="venues" className="mt-4">
            {venues.length === 0 ? (
               <div className="text-center text-muted-foreground mt-8">
                   No venues found for this event.
               </div>
            ) : (
               <ResourceGrid
                 type="venue"
                 items={venues}
                 onDragStart={handleDragStart} // Pass the handler
                 // Assuming ResourceGrid handles filtering internally based on these options
                 // Or you might need to implement filtering logic here and pass filtered items
                 filterOptions={[
                   { label: "All Venues", value: "all" },
                   { label: "Available", value: "available" },
                   { label: "Booked", value: "booked" } // Or "Assigned" depending on your logic
                 ]}
                 // Pass any other props ResourceGrid expects, e.g., rendering function for items
               />
            )}
          </TabsContent>

          <TabsContent value="vehicles">
            <p className="text-muted-foreground text-center mt-4">Vehicle management not implemented.</p>
          </TabsContent>
           <TabsContent value="teams">
             <p className="text-muted-foreground text-center mt-4">Team management not implemented.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content - Placeholder for Timeline View */}
      <div className="flex-1 flex flex-col p-4">
        <h1 className="text-xl font-bold mb-4">Event Timeline / Assignment Area</h1>
        <div className="flex-1 border rounded-lg bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Timeline or Drop Area Here</p>
          {/* This is where you'd likely implement the drop target for drag-and-drop */}
        </div>
      </div>
    </div>
  );
}
