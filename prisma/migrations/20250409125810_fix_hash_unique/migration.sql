/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Block` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Block_hash_key" ON "Block"("hash");
