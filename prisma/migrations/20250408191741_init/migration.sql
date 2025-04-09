-- CreateTable
CREATE TABLE "Block" (
    "id" BIGSERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "previousHash" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "publisherKey" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "height" BIGINT NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);
