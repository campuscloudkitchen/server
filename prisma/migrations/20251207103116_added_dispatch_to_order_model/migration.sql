-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "dispatchRiderId" TEXT,
ADD COLUMN     "dispatchedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_dispatchRiderId_fkey" FOREIGN KEY ("dispatchRiderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
