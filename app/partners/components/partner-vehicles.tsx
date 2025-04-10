"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleList } from "./vehicle-list";
import { Car, PlusIcon } from "lucide-react";

interface PartnerVehiclesProps {
  partnerId: string;
}

export function PartnerVehicles({ partnerId }: PartnerVehiclesProps) {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" />
              Partner Vehicles
            </CardTitle>
            <CardDescription>
              Manage vehicles associated with this partner
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Vehicles</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <VehicleList partnerId={partnerId} />
          </TabsContent>

          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle>Available Vehicles</CardTitle>
                <CardDescription>
                  Vehicles that are currently available for assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature is coming soon. You can view and filter all vehicles in the "All Vehicles" tab.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
