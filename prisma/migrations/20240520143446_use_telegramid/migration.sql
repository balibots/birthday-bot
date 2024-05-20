/*
  Warnings:

  - You are about to drop the column `telegramId` on the `GroupChat` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GroupChat_telegramId_key";

-- AlterTable
ALTER TABLE "GroupChat" DROP COLUMN "telegramId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "GroupChat_id_seq";
