/*
  Warnings:

  - A unique constraint covering the columns `[spaceId,title]` on the table `Stream` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "spaceId" TEXT NOT NULL DEFAULT 'randomID';

-- CreateIndex
CREATE UNIQUE INDEX "Stream_spaceId_title_key" ON "Stream"("spaceId", "title");
