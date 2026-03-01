-- AlterTable
ALTER TABLE "products" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "itemCode" TEXT,
ADD COLUMN     "originalPrice" DECIMAL(10,2),
ADD COLUMN     "rating" DECIMAL(3,2),
ADD COLUMN     "reviews" INTEGER DEFAULT 0;
