-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "deliveryEta" TIMESTAMP(3),
ADD COLUMN     "shippingProvider" TEXT,
ADD COLUMN     "trackingId" TEXT;
