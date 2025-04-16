/*
  Warnings:

  - A unique constraint covering the columns `[nextIsChauffeurId]` on the table `Chauffeur` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Chauffeur` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DRIVER_LICENSE', 'IDENTITY_CARD', 'VTC_CARD', 'REGISTRATION_CARD', 'INSURANCE_CERTIFICATE', 'TECHNICAL_INSPECTION', 'VTC_REGISTRY', 'EXPLOITATION_CERTIFICATE');

-- DropForeignKey
ALTER TABLE "Chauffeur" DROP CONSTRAINT "Chauffeur_userId_fkey";

-- AlterTable
ALTER TABLE "Chauffeur" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isExternalChauffeur" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "nextIsChauffeurId" TEXT,
ADD COLUMN     "partnerId" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "chauffeurId" TEXT,
    "vehicleId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_nextIsChauffeurId_key" ON "Chauffeur"("nextIsChauffeurId");

-- AddForeignKey
ALTER TABLE "Chauffeur" ADD CONSTRAINT "Chauffeur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chauffeur" ADD CONSTRAINT "Chauffeur_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
