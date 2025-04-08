export type PremierSeasonCategory = 
  | 'GLOBAL_SPORTS' 
  | 'CULTURAL_EVENTS' 
  | 'BUSINESS_EVENTS'

export type PremierSeasonStatus = 
  | 'UPCOMING'
  | 'ACTIVE'
  | 'COMPLETED'

export interface PremierSeason {
  id: string
  title: string
  category: PremierSeasonCategory
  startDate: Date
  endDate: Date
  status: PremierSeasonStatus
  description: string
  serviceTier: 'PREMIUM' | 'EXCLUSIVE' | 'ULTRA'
  location: string
  expectedAttendance: number
}