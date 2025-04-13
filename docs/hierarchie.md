# Hierarchical Structure

This document outlines the hierarchical structure used throughout the application, particularly for assignments and relationships between different entities.

## Core Hierarchy

The application follows a strict hierarchical structure for all assignments and relationships:

1. **Premier Event** (highest level)
   - Can include multiple Events
   - Represents a major event series or season
   - Example: "International Conference 2025"

2. **Event**
   - Belongs to a Premier Event (optional)
   - Can include multiple Missions
   - Represents a specific event with a defined timeframe
   - Example: "Opening Ceremony"

3. **Mission**
   - Belongs to an Event
   - Can include multiple Rides
   - Represents a specific assignment for a chauffeur or vehicle for a defined period
   - Example: "VIP Transportation Day 1"

4. **Ride**
   - Belongs to a Mission
   - Represents a specific journey from point A to point B
   - Example: "Airport to Hotel Transfer"

5. **Chauffeur** (lowest level)
   - Assigned to specific Rides
   - Represents the individual driver

## Assignment Rules

When assigning resources (such as vehicles or chauffeurs), the following rules apply:

1. Resources can be assigned at any level of the hierarchy
2. Assignments at higher levels take precedence over lower levels
3. When a resource is assigned to a higher-level entity, it is considered reserved for all child entities
4. Conflicts should be resolved by prioritizing higher-level assignments

## Implementation Guidelines

When implementing features related to this hierarchy:

1. Always maintain the hierarchical order in dropdowns, lists, and selection interfaces
2. Display the hierarchy visually when showing relationships between entities
3. Validate assignments to prevent conflicts
4. When searching or filtering, respect the hierarchical structure
5. When displaying assignments, show the complete hierarchical path

## UI Considerations

1. Use consistent visual cues to indicate the level in the hierarchy
2. Use indentation or tree structures to show parent-child relationships
3. Color-code different levels for easier identification
4. Provide clear navigation between levels

## Database Relationships

The database schema should reflect this hierarchy with appropriate foreign key relationships:

```
PremierEvent 1:N Event 1:N Mission 1:N Ride N:1 Chauffeur
```

This ensures data integrity and enables efficient queries across the hierarchy.
