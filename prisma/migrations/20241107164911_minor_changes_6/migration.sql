/*
  Warnings:

  - The `expirationTime` column on the `PushSubscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "expirationTime",
ADD COLUMN     "expirationTime" INTEGER;
