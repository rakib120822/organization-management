/*
  Warnings:

  - You are about to drop the column `organizationId` on the `TASK` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TASK" DROP CONSTRAINT "TASK_organizationId_fkey";

-- AlterTable
ALTER TABLE "TASK" DROP COLUMN "organizationId";
