/*
  Warnings:

  - The primary key for the `GroupChat` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_groupChatId_fkey";

-- AlterTable
ALTER TABLE "GroupChat" DROP CONSTRAINT "GroupChat_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "GroupChat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "groupChatId" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupChatId_fkey" FOREIGN KEY ("groupChatId") REFERENCES "GroupChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
