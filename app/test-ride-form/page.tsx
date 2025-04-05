"use client";

import { RideForm } from "@/components/forms/ride-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for testing
const mockUsers = [
  { id: "user1", name: "John Doe" },
  { id: "user2", name: "Jane Smith" },
  { id: "user3", name: "Bob Johnson" },
];

const mockChauffeurs = [
  { id: "chauffeur1", name: "Alex Driver" },
  { id: "chauffeur2", name: "Sam Wheels" },
];

const mockClients = [
  { id: "client1", name: "Acme Corp" },
  { id: "client2", name: "Globex Inc" },
];

const mockPartners = [
  { id: "partner1", name: "Luxury Cars Ltd" },
  { id: "partner2", name: "Premium Rides Co" },
];

const mockProjects = [
  { id: "project1", name: "Corporate Event" },
  { id: "project2", name: "Wedding Service" },
];

const mockExistingMissions = [
  { id: "mission1", title: "VIP Airport Transfer", chauffeurId: "chauffeur1" },
];

export default function TestRideFormPage() {
  const handleCreateRide = (data: any) => {
    console.log("Ride created:", data);
    alert("Ride created successfully! Check console for details.");
  };

  return (
    <div className="container py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Test Ride Form</CardTitle>
        </CardHeader>
        <CardContent>
          <RideForm
            onAddRide={handleCreateRide}
            users={mockUsers}
            chauffeurs={mockChauffeurs}
            clients={mockClients}
            partners={mockPartners}
            projects={mockProjects}
            existingMissions={mockExistingMissions}
            showMissionButton={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
