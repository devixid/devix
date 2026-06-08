-- Post-estimator consultation feedback linked to contact submissions.
CREATE TABLE "consultation_feedback" (
    "id" TEXT NOT NULL,
    "contactSubmissionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_feedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "consultation_feedback_contactSubmissionId_key" ON "consultation_feedback"("contactSubmissionId");
CREATE INDEX "consultation_feedback_isRead_idx" ON "consultation_feedback"("isRead");
CREATE INDEX "consultation_feedback_createdAt_idx" ON "consultation_feedback"("createdAt");

ALTER TABLE "consultation_feedback" ADD CONSTRAINT "consultation_feedback_contactSubmissionId_fkey" FOREIGN KEY ("contactSubmissionId") REFERENCES "contact_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
