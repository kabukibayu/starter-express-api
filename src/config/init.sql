CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "Device" (
	"ID" UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	"Name" VARCHAR NOT NULL,
	"Token" VARCHAR NOT NULL,
	"Created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"LatestUpdated" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Telemetry" (
	"ID" UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	"DeviceID" UUID NOT NULL,
	"Name" VARCHAR NOT NULL,
	"Created" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"LatestUpdated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT "uniquedata" UNIQUE ("DeviceID", "Name")
);

CREATE TABLE "TelemetryHistory" (
  "ID" UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  "TelemetryID" UUID NOT NULL,
  "Value" VARCHAR NOT NULL,
  "Date" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Telemetry" ADD FOREIGN KEY ("DeviceID") REFERENCES "Device" ("ID");

ALTER TABLE "TelemetryHistory" ADD FOREIGN KEY ("TelemetryID") REFERENCES "Telemetry" ("ID");
