import { format } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin } from "lucide-react"
import { PremierSeason } from "@/types/premier-season"

interface PremierSeasonCardProps {
  season: PremierSeason
  onSelect: (season: PremierSeason) => void
}

export function PremierSeasonCard({ season, onSelect }: PremierSeasonCardProps) {
  const statusColors = {
    UPCOMING: "bg-blue-100 text-blue-800",
    ACTIVE: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {season.title}
        </CardTitle>
        <Badge className={statusColors[season.status]}>
          {season.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            {format(season.startDate, "MMM d")} - {format(season.endDate, "MMM d, yyyy")}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {season.location}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            {season.expectedAttendance.toLocaleString()} expected attendees
          </div>
          <Badge variant="outline" className="w-fit mt-2">
            {season.serviceTier} Tier
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onSelect(season)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}