-- AlterTable
ALTER TABLE "memories" ADD COLUMN     "chapter_id" TEXT;

-- CreateTable
CREATE TABLE "memory_likes" (
    "id" TEXT NOT NULL,
    "memory_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_comments" (
    "id" TEXT NOT NULL,
    "memory_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "desde" INTEGER NOT NULL,
    "hasta" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memory_likes_memory_id_user_id_key" ON "memory_likes"("memory_id", "user_id");

-- CreateIndex
CREATE INDEX "memory_comments_memory_id_created_at_idx" ON "memory_comments"("memory_id", "created_at");

-- CreateIndex
CREATE INDEX "chapters_owner_id_idx" ON "chapters"("owner_id");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_likes" ADD CONSTRAINT "memory_likes_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_likes" ADD CONSTRAINT "memory_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_comments" ADD CONSTRAINT "memory_comments_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_comments" ADD CONSTRAINT "memory_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
