-- CreateTable
CREATE TABLE "plan_reviews" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "spec_path" TEXT,
    "md_path" TEXT,
    "score" INTEGER,
    "decision" TEXT,
    "payload" JSONB NOT NULL,
    "reviewer" TEXT NOT NULL DEFAULT 'solo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yc_answers" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "q1_demand" TEXT,
    "q2_status_quo" TEXT,
    "q3_specific" TEXT,
    "q4_wedge" TEXT,
    "q5_observation" TEXT,
    "q6_future_fit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yc_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_reviews_project_id_kind_created_at_idx" ON "plan_reviews"("project_id", "kind", "created_at");

-- CreateIndex
CREATE INDEX "yc_answers_project_id_created_at_idx" ON "yc_answers"("project_id", "created_at");

-- AddForeignKey
ALTER TABLE "plan_reviews" ADD CONSTRAINT "plan_reviews_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yc_answers" ADD CONSTRAINT "yc_answers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
