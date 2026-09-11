-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'family_link_proposed';
ALTER TYPE "NotificationType" ADD VALUE 'family_link_accepted';
ALTER TYPE "NotificationType" ADD VALUE 'family_link_rejected';

-- AlterTable
ALTER TABLE "family_members" ADD COLUMN     "link_pendiente_user_id" TEXT,
ADD COLUMN     "link_propuesto_en" TIMESTAMP(3);
