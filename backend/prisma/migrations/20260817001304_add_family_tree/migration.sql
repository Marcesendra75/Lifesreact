-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "gender" "Gender",
    "birth_date" DATE,
    "death_date" DATE,
    "photo_key" TEXT,
    "bio" TEXT,
    "mother_id" TEXT,
    "father_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_partners" (
    "id" TEXT NOT NULL,
    "member_a_id" TEXT NOT NULL,
    "member_b_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "family_members_owner_id_idx" ON "family_members"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "family_partners_member_a_id_member_b_id_key" ON "family_partners"("member_a_id", "member_b_id");

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_partners" ADD CONSTRAINT "family_partners_member_a_id_fkey" FOREIGN KEY ("member_a_id") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_partners" ADD CONSTRAINT "family_partners_member_b_id_fkey" FOREIGN KEY ("member_b_id") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
