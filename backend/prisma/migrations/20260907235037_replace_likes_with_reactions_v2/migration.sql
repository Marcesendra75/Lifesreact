/*
  Warnings:

  - You are about to drop the `memory_likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('emocionante', 'inspirador', 'recordare', 'conmueve');

-- DropForeignKey
ALTER TABLE "memory_likes" DROP CONSTRAINT "memory_likes_memory_id_fkey";

-- DropForeignKey
ALTER TABLE "memory_likes" DROP CONSTRAINT "memory_likes_user_id_fkey";

-- DropTable
DROP TABLE "memory_likes";

-- CreateTable
CREATE TABLE "memory_reactions" (
    "id" TEXT NOT NULL,
    "memory_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memory_reactions_memory_id_user_id_key" ON "memory_reactions"("memory_id", "user_id");

-- AddForeignKey
ALTER TABLE "memory_reactions" ADD CONSTRAINT "memory_reactions_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_reactions" ADD CONSTRAINT "memory_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
