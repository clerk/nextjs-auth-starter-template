-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "isForeignPlate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partnerId" TEXT,
ADD COLUMN     "registrationDate" TEXT;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
