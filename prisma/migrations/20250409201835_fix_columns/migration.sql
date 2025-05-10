/*
  Warnings:

  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Block";

-- CreateTable
CREATE TABLE "block" (
    "id" BIGSERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "previous_hash" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "data" JSONB NOT NULL,
    "publisher_key" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "height" BIGINT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "block_hash_key" ON "block"("hash");
