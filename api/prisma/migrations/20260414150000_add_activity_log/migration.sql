-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "actor" TEXT,
    "actor_type" TEXT,
    "method" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "project_id" TEXT,
    "task_id" TEXT,
    "args_summary" JSONB,
    "result_summary" JSONB,
    "status_code" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_project_id_created_at_idx" ON "activity_logs"("project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_actor_created_at_idx" ON "activity_logs"("actor", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_task_id_created_at_idx" ON "activity_logs"("task_id", "created_at" DESC);
