CREATE TABLE "application_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"create_org" boolean DEFAULT false NOT NULL,
	"organization" text,
	"uri" text,
	"logo" text,
	"scopes" text NOT NULL,
	"redirect_uris" text[] NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "task";--> statement-breakpoint
ALTER TABLE "application_requests" ADD CONSTRAINT "application_requests_organization_organization_id_fkey" FOREIGN KEY ("organization") REFERENCES "organization"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "application_requests" ADD CONSTRAINT "application_requests_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;