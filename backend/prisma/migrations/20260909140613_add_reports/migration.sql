-- CreateEnum
CREATE TYPE "ReportEntityType" AS ENUM ('memory', 'comment', 'user');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('spam', 'contenido_inapropiado', 'acoso', 'discurso_odio', 'violencia', 'desnudez_sexual', 'informacion_falsa', 'suplantacion', 'otro');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "entity_type" "ReportEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "detalle" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "ai_flagged" BOOLEAN NOT NULL DEFAULT false,
    "ai_categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "reports_entity_type_entity_id_idx" ON "reports"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_reporter_id_entity_type_entity_id_key" ON "reports"("reporter_id", "entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
