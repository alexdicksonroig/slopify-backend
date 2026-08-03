CREATE TABLE "variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"possible_options" text[] NOT NULL,
	"label" text NOT NULL
);