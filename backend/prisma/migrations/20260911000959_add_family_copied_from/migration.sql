-- AlterTable
ALTER TABLE "family_members" ADD COLUMN     "copied_from_id" TEXT;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_copied_from_id_fkey" FOREIGN KEY ("copied_from_id") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
