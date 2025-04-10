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
import { ChauffeurList } from "./chauffeur-list";
import { User, Users } from "lucide-react";

interface PartnerChauffeursProps {
  partnerId: string;
}

export function PartnerChauffeurs({ partnerId }: PartnerChauffeursProps) {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Partner Chauffeurs
            </CardTitle>
            <CardDescription>
              Manage chauffeurs associated with this partner
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Chauffeurs</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ChauffeurList partnerId={partnerId} />
          </TabsContent>
          
          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle>Available Chauffeurs</CardTitle>
                <CardDescription>
                  Chauffeurs that are currently available for assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature is coming soon. You can view and filter all chauffeurs in the "All Chauffeurs" tab.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
