/*
  Warnings:

  - You are about to drop the column `p256h` on the `PushSubscription` table. All the data in the column will be lost.
  - Added the required column `p256dh` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "p256h",
ADD COLUMN     "p256dh" TEXT NOT NULL;
