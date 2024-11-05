/*
  Warnings:

  - The values [CREATE_USER,UPDATE_USER,DELETE_USER] on the enum `ACTIONS` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `is_completed` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `_TaskLabels` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ACTIONS_new" AS ENUM ('CREATE_PROJECT', 'UPDATE_PROJECT', 'DELETE_PROJECT', 'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY', 'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'CREATE_LABEL', 'UPDATE_LABEL', 'DELETE_LABEL', 'CREATE_COMMENT', 'UPDATE_COMMENT', 'DELETE_COMMENT');
ALTER TABLE "ActivityLog" ALTER COLUMN "action" TYPE "ACTIONS_new" USING ("action"::text::"ACTIONS_new");
ALTER TYPE "ACTIONS" RENAME TO "ACTIONS_old";
ALTER TYPE "ACTIONS_new" RENAME TO "ACTIONS";
DROP TYPE "ACTIONS_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "_TaskLabels" DROP CONSTRAINT "_TaskLabels_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskLabels" DROP CONSTRAINT "_TaskLabels_B_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createdAt",
DROP COLUMN "name",
DROP COLUMN "updatedAt",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "dueDate",
DROP COLUMN "is_completed",
DROP COLUMN "projectId",
DROP COLUMN "title",
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "labelId" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "priority" SET NOT NULL,
ALTER COLUMN "priority" SET DATA TYPE TEXT,
ALTER COLUMN "categoryId" SET NOT NULL;

-- DropTable
DROP TABLE "_TaskLabels";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;
