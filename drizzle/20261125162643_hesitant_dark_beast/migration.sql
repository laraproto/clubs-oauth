ALTER TABLE "application_requests" ADD COLUMN "reason" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application_requests" ADD COLUMN "reviewer" text;--> statement-breakpoint
ALTER TABLE "application_requests" ADD COLUMN "process_reason" text;--> statement-breakpoint
ALTER TABLE "application_requests" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "application_requests" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "application_requests" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "application_requests" ADD CONSTRAINT "application_requests_reviewer_user_id_fkey" FOREIGN KEY ("reviewer") REFERENCES "user"("id") ON DELETE SET NULL;