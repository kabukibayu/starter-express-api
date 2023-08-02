CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "device" (
	"id" UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	"name" VARCHAR NOT NULL,
	"token" VARCHAR NOT NULL,
	"created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"latestupdated" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "telemetry" (
	"id" UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	"deviceid" UUID NOT NULL,
	"name" VARCHAR NOT NULL,
	"created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"latestupdated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT "uniquedata" UNIQUE ("deviceid", "name")
);

CREATE TABLE "telemetryhistory" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "telemetryid" UUID NOT NULL,
  "value" VARCHAR NOT NULL,
  "date" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "telemetry" ADD FOREIGN KEY ("deviceid") REFERENCES "device" ("id");

ALTER TABLE "telemetryhistory" ADD FOREIGN KEY ("telemetryid") REFERENCES "telemetry" ("id");
