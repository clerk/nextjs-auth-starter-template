import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users } from "lucide-react"

interface VenueCardProps {
  venue: Venue
  assigned: boolean
  conflicts: Conflict[]
}

export function VenueCard({ venue, assigned, conflicts }: VenueCardProps) {
  return (
    <Card className={cn(
      "p-4 cursor-pointer hover:shadow-md transition-shadow",
      assigned && "border-primary",
      conflicts.length > 0 && "border-destructive"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{venue.name}</h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{venue.address}</span>
          </div>
        </div>
        <Badge variant={getStatusVariant(venue.status)}>
          {venue.status}
        </Badge>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>{format(venue.startTime, "HH:mm")}</span>
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          <span>{venue.capacity}</span>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="mt-3 p-2 bg-destructive/10 rounded-sm text-destructive text-sm">
          {conflicts.length} scheduling conflicts
        </div>
      )}
    </Card>
  )
}