-- CreateTable
CREATE TABLE "hidden_comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hidden_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hidden_comments_user_id_comment_id_key" ON "hidden_comments"("user_id", "comment_id");

-- AddForeignKey
ALTER TABLE "hidden_comments" ADD CONSTRAINT "hidden_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hidden_comments" ADD CONSTRAINT "hidden_comments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "memory_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
