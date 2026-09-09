-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('pareja', 'padre', 'madre', 'hijo', 'hermano', 'abuelo', 'primo', 'familiar', 'amigo', 'conocido', 'companero', 'colega');

-- AlterTable
ALTER TABLE "connections" ADD COLUMN     "relation_type" "RelationType" NOT NULL DEFAULT 'amigo',
ADD COLUMN     "relation_type_pendiente" "RelationType",
ADD COLUMN     "relation_type_propuesto_en" TIMESTAMP(3),
ADD COLUMN     "relation_type_propuesto_por" TEXT,
ADD COLUMN     "relation_type_rechazado_en" TIMESTAMP(3);
