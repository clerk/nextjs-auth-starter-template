/*
  Warnings:

  - You are about to drop the column `email` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `isExternalChauffeur` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `nextIsChauffeurId` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `partnerId` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Chauffeur` table. All the data in the column will be lost.
  - You are about to drop the column `fuelType` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `isForeignPlate` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `registrationDate` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `userId` on table `Chauffeur` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Chauffeur" DROP CONSTRAINT "Chauffeur_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "Chauffeur" DROP CONSTRAINT "Chauffeur_userId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_chauffeurId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_vehicleId_fkey";

-- DropIndex
DROP INDEX "Chauffeur_nextIsChauffeurId_key";

-- AlterTable
ALTER TABLE "Chauffeur" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "isExternalChauffeur",
DROP COLUMN "lastName",
DROP COLUMN "nextIsChauffeurId",
DROP COLUMN "partnerId",
DROP COLUMN "phone",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "fuelType",
DROP COLUMN "isForeignPlate",
DROP COLUMN "registrationDate",
ADD COLUMN     "isFrenchPlate" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Document";

-- DropEnum
DROP TYPE "DocumentType";

-- AddForeignKey
ALTER TABLE "Chauffeur" ADD CONSTRAINT "Chauffeur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
