-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('INTERNAL', 'EXTERNAL', 'AFFILIATE');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PartnerRole" AS ENUM ('SERVICE_PROVIDER', 'CHAUFFEUR_SERVICE', 'VEHICLE_PROVIDER', 'LOGISTICS_PARTNER', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "PartnerRideStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PARTNER';

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "type" "PartnerType" NOT NULL DEFAULT 'EXTERNAL',
    "status" "PartnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ratePerKm" DECIMAL(10,2),
    "ratePerHour" DECIMAL(10,2),
    "minimumFare" DECIMAL(10,2),
    "commissionRate" DECIMAL(5,2),
    "paymentTerms" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankRoutingNumber" TEXT,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPartner" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "role" "PartnerRole" NOT NULL DEFAULT 'SERVICE_PROVIDER',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "fee" DECIMAL(10,2),
    "commissionRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionPartner" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "role" "PartnerRole" NOT NULL DEFAULT 'SERVICE_PROVIDER',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "fee" DECIMAL(10,2),
    "commissionRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RidePartner" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "role" "PartnerRole" NOT NULL DEFAULT 'SERVICE_PROVIDER',
    "status" "PartnerRideStatus" NOT NULL DEFAULT 'ASSIGNED',
    "notes" TEXT,
    "fee" DECIMAL(10,2),
    "commissionRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RidePartner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EventPartner_eventId_partnerId_key" ON "EventPartner"("eventId", "partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionPartner_missionId_partnerId_key" ON "MissionPartner"("missionId", "partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "RidePartner_rideId_partnerId_key" ON "RidePartner"("rideId", "partnerId");

-- AddForeignKey
ALTER TABLE "EventPartner" ADD CONSTRAINT "EventPartner_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPartner" ADD CONSTRAINT "EventPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionPartner" ADD CONSTRAINT "MissionPartner_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionPartner" ADD CONSTRAINT "MissionPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePartner" ADD CONSTRAINT "RidePartner_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePartner" ADD CONSTRAINT "RidePartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
