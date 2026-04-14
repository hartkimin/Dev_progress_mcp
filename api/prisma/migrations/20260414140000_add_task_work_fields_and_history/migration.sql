-- AlterTable: per-status work content
ALTER TABLE "tasks" ADD COLUMN "work_todo" TEXT;
ALTER TABLE "tasks" ADD COLUMN "work_in_progress" TEXT;
ALTER TABLE "tasks" ADD COLUMN "work_review" TEXT;
ALTER TABLE "tasks" ADD COLUMN "work_done" TEXT;

-- CreateTable: status transition history
CREATE TABLE "task_status_history" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "note" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT,

    CONSTRAINT "task_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_status_history_task_id_changed_at_idx" ON "task_status_history"("task_id", "changed_at");

-- AddForeignKey
ALTER TABLE "task_status_history" ADD CONSTRAINT "task_status_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
