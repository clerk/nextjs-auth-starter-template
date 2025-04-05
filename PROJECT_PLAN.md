# Chauffeur Management System - Project Plan

## Overview
This document outlines the detailed plan for building a comprehensive chauffeur management system with features for booking, ride assignment, organization management, and role-based access control.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Authentication**: Clerk Auth
- **Database**: Prisma with Supabase (PostgreSQL)
- **Form Handling**: react-hook-form with zod validation
- **Data Fetching**: tRPC + react-query
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Date Utilities**: date-fns
- **AI Integration**: AI Toolkit
- **URL Search Params**: nuqs
- **Charts**: Recharts
- **State Management**: Zustand

## User Roles
1. **Admin**: Full system access
2. **Sales**: Manage clients and contracts
3. **Customer**: Organization admin who can book rides
4. **Passenger**: End-user who takes rides
5. **Planning**: Schedule and plan rides
6. **Dispatcher**: Assign chauffeurs to rides
7. **Field Manager**: Oversee chauffeur operations
8. **Field Assistant**: Support field operations
9. **Chauffeur**: Execute rides

## Database Schema

### Users
```prisma
model User {
  id            String    @id @default(cuid())
  clerkId       String    @unique
  email         String    @unique
  firstName     String
  lastName      String
  phone         String?
  role          Role      @default(PASSENGER)
  organizationId String?
  organization  Organization? @relation(fields: [organizationId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  chauffeurProfile Chauffeur?
  rides         Ride[]    @relation("PassengerRides")
  assignedRides Ride[]    @relation("AssignedRides")
  bookings      Booking[]
}

enum Role {
  ADMIN
  SALES
  CUSTOMER
  PASSENGER
  PLANNING
  DISPATCHER
  FIELD_MANAGER
  FIELD_ASSISTANT
  CHAUFFEUR
}
```

### Organizations
```prisma
model Organization {
  id            String    @id @default(cuid())
  name          String
  address       String?
  city          String?
  country       String?
  postalCode    String?
  phone         String?
  email         String?
  website       String?
  logoUrl       String?
  active        Boolean   @default(true)
  contractStart DateTime?
  contractEnd   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  users         User[]
  bookings      Booking[]
  billingInfo   BillingInfo?
}

model BillingInfo {
  id              String       @id @default(cuid())
  organizationId  String       @unique
  organization    Organization @relation(fields: [organizationId], references: [id])
  billingAddress  String?
  billingCity     String?
  billingCountry  String?
  billingPostalCode String?
  taxId           String?
  paymentTerms    String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}
```

### Chauffeurs
```prisma
model Chauffeur {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  licenseNumber String
  licenseExpiry DateTime
  vehicleId     String?
  vehicle       Vehicle?  @relation(fields: [vehicleId], references: [id])
  status        ChauffeurStatus @default(AVAILABLE)
  rating        Float?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum ChauffeurStatus {
  AVAILABLE
  BUSY
  ON_BREAK
  OFF_DUTY
  ON_LEAVE
}
```

### Vehicles
```prisma
model Vehicle {
  id            String    @id @default(cuid())
  make          String
  model         String
  year          Int
  licensePlate  String    @unique
  color         String?
  capacity      Int       @default(4)
  vehicleType   VehicleType @default(SEDAN)
  status        VehicleStatus @default(AVAILABLE)
  lastMaintenance DateTime?
  chauffeurs    Chauffeur[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum VehicleType {
  SEDAN
  SUV
  VAN
  LUXURY
  LIMOUSINE
}

enum VehicleStatus {
  AVAILABLE
  IN_USE
  MAINTENANCE
  OUT_OF_SERVICE
}
```

### Bookings and Rides
```prisma
model Booking {
  id            String    @id @default(cuid())
  bookingNumber String    @unique @default(cuid())
  customerId    String
  customer      User      @relation(fields: [customerId], references: [id])
  organizationId String?
  organization  Organization? @relation(fields: [organizationId], references: [id])
  status        BookingStatus @default(PENDING)
  totalAmount   Decimal?  @db.Decimal(10, 2)
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  rides         Ride[]
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Ride {
  id            String    @id @default(cuid())
  rideNumber    String    @unique @default(cuid())
  bookingId     String
  booking       Booking   @relation(fields: [bookingId], references: [id])
  passengerId   String
  passenger     User      @relation("PassengerRides", fields: [passengerId], references: [id])
  chauffeurId   String?
  chauffeur     User?     @relation("AssignedRides", fields: [chauffeurId], references: [id])
  pickupAddress String
  dropoffAddress String
  pickupTime    DateTime
  dropoffTime   DateTime?
  status        RideStatus @default(SCHEDULED)
  fare          Decimal?  @db.Decimal(10, 2)
  distance      Decimal?  @db.Decimal(10, 2)
  duration      Int?      // in minutes
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum RideStatus {
  SCHEDULED
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

## Project Structure

```
dropnow-admin-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── components/
│   │   ├── rides/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── components/
│   │   ├── organizations/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── components/
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── components/
│   │   ├── chauffeurs/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── components/
│   │   ├── vehicles/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── components/
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts
│   │   ├── clerk/webhook/route.ts
│   │   └── uploadthing/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ... (other shadcn components)
│   ├── forms/
│   │   ├── booking-form.tsx
│   │   ├── organization-form.tsx
│   │   ├── user-form.tsx
│   │   ├── chauffeur-form.tsx
│   │   └── vehicle-form.tsx
│   ├── tables/
│   │   ├── bookings-table.tsx
│   │   ├── rides-table.tsx
│   │   ├── users-table.tsx
│   │   └── ... (other tables)
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── recent-bookings.tsx
│   │   ├── upcoming-rides.tsx
│   │   └── charts/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── user-nav.tsx
│   │   └── mobile-nav.tsx
│   └── shared/
│       ├── loading-spinner.tsx
│       ├── error-message.tsx
│       └── empty-state.tsx
├── lib/
│   ├── utils.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── trpc/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── routers/
│   │       ├── booking.ts
│   │       ├── ride.ts
│   │       ├── user.ts
│   │       ├── organization.ts
│   │       ├── chauffeur.ts
│   │       └── vehicle.ts
│   └── validations/
│       ├── booking.ts
│       ├── organization.ts
│       ├── user.ts
│       └── ... (other schemas)
├── hooks/
│   ├── use-bookings.ts
│   ├── use-rides.ts
│   ├── use-organizations.ts
│   ├── use-users.ts
│   └── ... (other hooks)
├── store/
│   ├── booking-store.ts
│   ├── ride-store.ts
│   ├── user-store.ts
│   └── ... (other stores)
├── types/
│   ├── index.ts
│   ├── booking.ts
│   ├── ride.ts
│   └── ... (other type definitions)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   ├── icons/
│   └── ... (other static assets)
├── middleware.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── ... (other config files)
```

## Implementation Plan

### Phase 1: Project Setup and Authentication
1. **Setup Next.js Project**
   - Install required dependencies
   - Configure TypeScript
   - Set up ESLint and Prettier

2. **Setup Clerk Authentication**
   - Configure Clerk
   - Create sign-in and sign-up pages
   - Implement middleware for protected routes
   - Set up webhook for user synchronization

3. **Setup Database**
   - Configure Prisma with Supabase
   - Create initial schema
   - Set up database migrations

4. **Setup tRPC**
   - Configure tRPC server
   - Set up API routes
   - Create base routers

### Phase 2: Core Features - Users and Organizations
1. **User Management**
   - Implement user CRUD operations
   - Create user profile pages
   - Implement role-based access control

2. **Organization Management**
   - Implement organization CRUD operations
   - Create organization profile pages
   - Implement organization member management

### Phase 3: Chauffeur and Vehicle Management
1. **Chauffeur Management**
   - Implement chauffeur profile creation
   - Create chauffeur availability system
   - Implement chauffeur rating system

2. **Vehicle Management**
   - Implement vehicle CRUD operations
   - Create vehicle status tracking
   - Implement vehicle maintenance scheduling

### Phase 4: Booking and Ride Management
1. **Booking System**
   - Implement booking creation flow
   - Create booking management interface
   - Implement booking status tracking

2. **Ride Assignment**
   - Create ride scheduling system
   - Implement chauffeur assignment algorithm
   - Create ride tracking interface

3. **Ride Execution**
   - Implement ride status updates
   - Create ride completion flow
   - Implement fare calculation

### Phase 5: Dashboard and Reporting
1. **Dashboard**
   - Create role-specific dashboards
   - Implement key metrics and statistics
   - Create data visualization with Recharts

2. **Reporting**
   - Implement report generation
   - Create export functionality
   - Implement analytics features

### Phase 6: Advanced Features
1. **Notifications**
   - Implement email notifications
   - Create in-app notification system
   - Set up SMS notifications for critical updates

2. **Mobile Optimization**
   - Ensure responsive design
   - Optimize for mobile usage
   - Implement progressive web app features

3. **AI Integration**
   - Implement intelligent ride matching
   - Create predictive analytics
   - Implement chatbot for customer support

## Role-Based Access Control

### Admin
- Full access to all system features
- User management
- Organization management
- System configuration

### Sales
- Organization management
- Contract management
- Customer onboarding
- Reporting and analytics

### Customer
- Booking management
- Organization member management
- Billing and invoices
- Reporting for their organization

### Passenger
- View and track assigned rides
- Update personal profile
- Rate chauffeurs
- Request new rides

### Planning
- Ride scheduling
- Resource allocation
- Optimization of routes
- Forecasting and planning

### Dispatcher
- Chauffeur assignment
- Real-time ride management
- Handling exceptions and changes
- Communication with chauffeurs

### Field Manager
- Chauffeur management
- Performance monitoring
- Quality assurance
- Training coordination

### Field Assistant
- Support field operations
- Equipment management
- Documentation
- Chauffeur support

### Chauffeur
- View assigned rides
- Update ride status
- Navigation assistance
- Communication with passengers

## API Endpoints (tRPC Routers)

### User Router
- createUser
- updateUser
- deleteUser
- getUserById
- getUsers
- updateUserRole

### Organization Router
- createOrganization
- updateOrganization
- deleteOrganization
- getOrganizationById
- getOrganizations
- addUserToOrganization
- removeUserFromOrganization

### Chauffeur Router
- createChauffeurProfile
- updateChauffeurProfile
- deleteChauffeurProfile
- getChauffeurById
- getChauffeurs
- updateChauffeurStatus
- assignVehicleToChauffeur

### Vehicle Router
- createVehicle
- updateVehicle
- deleteVehicle
- getVehicleById
- getVehicles
- updateVehicleStatus
- getAvailableVehicles

### Booking Router
- createBooking
- updateBooking
- deleteBooking
- getBookingById
- getBookings
- getBookingsByOrganization
- getBookingsByUser

### Ride Router
- createRide
- updateRide
- deleteRide
- getRideById
- getRides
- getRidesByBooking
- getRidesByPassenger
- getRidesByChauffeur
- assignChauffeurToRide
- updateRideStatus
- completeRide

## UI Components (shadcn/ui)

1. **Layout Components**
   - Dashboard layout
   - Sidebar navigation
   - Header with user menu
   - Mobile navigation

2. **Form Components**
   - Input fields
   - Select dropdowns
   - Date pickers
   - Form validation

3. **Table Components**
   - Data tables with sorting and filtering
   - Pagination
   - Action menus
   - Bulk actions

4. **Card Components**
   - Stat cards
   - Info cards
   - Action cards
   - Profile cards

5. **Modal Components**
   - Confirmation dialogs
   - Form modals
   - Information modals
   - Alert dialogs

6. **Chart Components**
   - Line charts
   - Bar charts
   - Pie charts
   - Area charts

## State Management (Zustand)

1. **User Store**
   - Current user information
   - Authentication state
   - User preferences

2. **Booking Store**
   - Active bookings
   - Booking form state
   - Booking filters

3. **Ride Store**
   - Active rides
   - Ride assignment state
   - Ride filters

4. **UI Store**
   - Sidebar state
   - Theme preferences
   - Notification state

## Next Steps and Timeline

### Week 1-2: Project Setup
- Set up Next.js project
- Configure authentication
- Set up database and schema
- Implement basic UI components

### Week 3-4: Core Features
- Implement user management
- Create organization management
- Set up role-based access control

### Week 5-6: Chauffeur and Vehicle Management
- Implement chauffeur profiles
- Create vehicle management
- Set up availability tracking

### Week 7-8: Booking and Ride Management
- Implement booking system
- Create ride assignment
- Set up ride tracking

### Week 9-10: Dashboard and Reporting
- Create dashboards
- Implement reporting
- Set up analytics

### Week 11-12: Advanced Features and Testing
- Implement notifications
- Optimize for mobile
- Comprehensive testing
- Deployment preparation

## Conclusion
This plan outlines the comprehensive approach to building a chauffeur management system with all the required features and functionality. The modular architecture and phased implementation will ensure a scalable, maintainable, and user-friendly application.
