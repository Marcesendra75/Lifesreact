-- CreateEnum
CREATE TYPE "CommentPrivacy" AS ENUM ('everyone', 'connections', 'nobody');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "comment_privacy" "CommentPrivacy" NOT NULL DEFAULT 'everyone';
