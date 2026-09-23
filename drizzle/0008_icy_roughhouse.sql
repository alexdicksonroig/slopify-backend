CREATE TABLE "site_languages" (
	"code" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"selected" boolean DEFAULT false NOT NULL
);
