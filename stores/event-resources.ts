import { create } from 'zustand'

interface EventResourceState {
  selectedDate: Date
  selectedItem: ResourceItem | null
  timelineItems: TimelineItem[]
  venues: Venue[]
  vehicles: Vehicle[]
  teams: Team[]
  conflicts: Conflict[]
  
  // Actions
  setSelectedDate: (date: Date) => void
  assignResource: (resource: ResourceItem, timeSlot: TimeSlot) => void
  updateResource: (id: string, updates: Partial<ResourceItem>) => void
  removeResource: (id: string) => void
  checkConflicts: () => Conflict[]
  optimizeSchedule: () => void
}

export const useEventResourceStore = create<EventResourceState>((set, get) => ({
  // ... state implementation
  
  assignResource: async (resource, timeSlot) => {
    // Validate assignment
    const conflicts = await validateAssignment(resource, timeSlot)
    if (conflicts.length > 0) {
      set({ conflicts })
      return false
    }

    // Update assignment
    const updated = await api.assignResource(resource.id, timeSlot)
    set(state => ({
      timelineItems: [...state.timelineItems, updated]
    }))
    return true
  },

  optimizeSchedule: async () => {
    const optimized = await api.optimizeEventSchedule(get().timelineItems)
    set({ timelineItems: optimized })
  }
}))