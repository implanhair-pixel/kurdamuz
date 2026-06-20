-- Add price to courses, and add course_enrollments / purchase_requests tables
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "price" integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "course_enrollments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "course_id" uuid NOT NULL REFERENCES "courses"("id"),
  "status" text NOT NULL DEFAULT 'active',
  "enrolled_at" timestamp DEFAULT now(),
  "completed_at" timestamp
);

CREATE TABLE IF NOT EXISTS "purchase_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "course_id" uuid NOT NULL REFERENCES "courses"("id"),
  "amount" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "note" text,
  "requested_at" timestamp DEFAULT now(),
  "reviewed_at" timestamp,
  "reviewed_by" uuid
);

CREATE INDEX IF NOT EXISTS "course_enrollments_user_id_idx" ON "course_enrollments" ("user_id");
CREATE INDEX IF NOT EXISTS "course_enrollments_course_id_idx" ON "course_enrollments" ("course_id");
CREATE INDEX IF NOT EXISTS "purchase_requests_user_id_idx" ON "purchase_requests" ("user_id");
CREATE INDEX IF NOT EXISTS "purchase_requests_status_idx" ON "purchase_requests" ("status");
