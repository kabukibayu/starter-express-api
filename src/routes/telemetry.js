const postRouter = require("express").Router();
const { createResponse } = require("../utils/response");
const { isUUID } = require("../utils/utility");
const { db } = require("../config/database");
const moment = require("moment");
require("dotenv").config();

postRouter.post("/post", async (req, res) => {
  try {
    const { deviceToken, telemetry } = req.body;
    if (!telemetry)
      return createResponse(res, 400, { telemetry: "telemetry cant be empty" });
    if (!deviceToken)
      return createResponse(res, 400, {
        deviceToken: "deviceToken value cant be empty",
      });

    var query = await db.query(
      `SELECT "id" FROM "device" WHERE "token"= '${deviceToken}';`
    );
    if (query.rows.length < 1)
      return createResponse(res, 400, { message: "Device Not Found" });
    var deviceId = query.rows[0].id;
    var telemetryId;
    var currentTimestamp = Date.now();

    for (key in telemetry) {
      console.log(key);
      console.log(telemetry[key]);

      telemetryId = await updateTelemetryTime(deviceId, key, currentTimestamp);
      await writeLogTelemetry(telemetryId, telemetry[key], currentTimestamp);
    }
    return createResponse(res, 200, { message: "post success" });
  } catch (error) {
    console.log(error);
    return createResponse(res, 500, { message: "Internal server error" });
  }
});

async function updateTelemetryTime(deviceId, telemetryName, currentTimestamp) {
  try {
    var query = await db.query(`
            SELECT "id", "latestupdated" FROM "telemetry" 
            WHERE "deviceid"= '${deviceId}' AND "name"= '${key}';`);

    if (!query.rows.length > 0) {
      query = await db.query(`
                INSERT INTO "telemetry" ("deviceid", "name", "latestupdated")
                VALUES ('${deviceId}', '${telemetryName}', to_timestamp(${currentTimestamp} /1000.0))
                RETURNING "id"`);
      return (telemetryId = query.rows[0].id);
    } else {
      telemetryId = query.rows[0].id;
      await db.query(`
                    UPDATE "telemetry"
                    SET "latestupdated"= to_timestamp(${currentTimestamp} /1000.0)
                    WHERE "id"= '${telemetryId}'`);
    }
    return telemetryId;
  } catch (error) {
    throw error;
  }
}

async function writeLogTelemetry(
  telemetryId,
  telemetryValue,
  currentTimestamp
) {
  try {
    await db
      .query(
        `
        INSERT INTO "telemetryhistory" ("telemetryid", "value", "date")
        VALUES ('${telemetryId}', '${telemetryValue}', to_timestamp(${currentTimestamp} /1000.0))`
      )
      .then(() => {});
  } catch (error) {
    throw error;
  }
}

postRouter.get("/get-latest", async (req, res) => {
  console.log(req.query.id);
  if (!req.query.id) {
    try {
      await db
        .query(
          `SELECT
                            "telemetry"."id",
                            "telemetry"."deviceid",
                            "telemetry"."name",
                            "telemetry"."created",
                            "telemetry"."latestupdated",
                            "telemetryhistory"."value"
                                FROM
                                    "telemetry"
                                INNER JOIN
                                    "telemetryhistory" ON "telemetry"."id" = "telemetryhistory"."telemetryid"
                                                    AND "telemetry"."latestupdated" = "telemetryhistory"."date"
                                INNER JOIN
                                    "device" ON "telemetry"."deviceid" = "device"."id"
                                WHERE
                                "device"."userid" = '${req.user.id}';
                                `
        )
        .then((query) => {
          return createResponse(res, 200, { list: query.rows });
        })
        .catch(async (error) => {
          console.log(error);
          return createResponse(res, 500, { message: "Internal server error" });
        });
    } catch (error) {
      console.log(error);
      return createResponse(res, 500, { message: "Internal server error" });
    }
  } else {
    try {
      await db
        .query(
          `SELECT
                            "telemetry"."id",
                            "telemetry"."deviceid",
                            "telemetry"."name",
                            "telemetry"."created",
                            "telemetry"."latestupdated",
                            "telemetryhistory"."value"
                                FROM
                                    "telemetry"
                                INNER JOIN
                                    "telemetryhistory" ON "telemetry"."id" = "telemetryhistory"."telemetryid"
                                                    AND "telemetry"."latestupdated" = "telemetryhistory"."date"
                                INNER JOIN
                                    "device" ON "telemetry"."deviceid" = "device"."id"
                                WHERE
                                "device"."userid" = '${req.user.id}' AND
                                "device"."id" = '${req.query.id}';
                                `
        )
        .then((query) => {
          return createResponse(res, 200, { list: query.rows });
        })
        .catch(async (error) => {
          console.log(error);
          return createResponse(res, 500, { message: "Internal server error" });
        });
    } catch (error) {
      console.log(error);
      return createResponse(res, 500, { message: "Internal server error" });
    }
  }
});

postRouter.get("/get-log", async (req, res) => {
  if (!req.query.id)
    return createResponse(res, 400, { id: "telemetry id param cant be empty" });
  if (!req.query.page) req.query.page = 1;
  if (!isUUID(req.query.id))
    return createResponse(res, 400, {
      id: "telemetry id param format is not valid",
    });
  try {
    summary = await db.query(` 
        SELECT COUNT(*) AS total FROM (SELECT "telemetry"."name", "telemetryhistory"."value", "telemetryhistory"."date" 
        FROM "telemetry"
        INNER JOIN "telemetryhistory" ON "telemetry"."id" = "telemetryhistory"."telemetryid"
        INNER JOIN "device" ON "telemetry"."deviceid" = "device"."id"
        WHERE "device"."userid" = '${req.user.id}' AND "telemetry"."id" = '${req.query.id}'
            ) AS subquery;`);
    query = await db.query(`SELECT
                        "telemetry"."name",
                        "telemetryhistory"."value",
                        "telemetryhistory"."date"
                            FROM
                                "telemetry"
                            INNER JOIN
                                "telemetryhistory" ON "telemetry"."id" = "telemetryhistory"."telemetryid"
                            INNER JOIN
                                "device" ON "telemetry"."deviceid" = "device"."id"
                            WHERE "device"."userid" = '${req.user.id}' 
                            AND "telemetry"."id" = '${req.query.id}'
                            ORDER BY "telemetryhistory"."date" DESC
                            LIMIT 10 
                            OFFSET (10 * (${req.query.page} - 1));
                            `);
    return createResponse(res, 200, {
      list: query.rows,
      summary: summary.rows[0].total,
    });
  } catch (error) {
    console.log(error);
    return createResponse(res, 500, { message: "Internal server error" });
  }
});

postRouter.get("/get-device-param-log", async (req, res) => {
  if (!req.query.id)
    return createResponse(res, 400, { id: "device id param cant be empty" });
  if (!req.query.limit) req.query.limit = 10;
  if (!req.query.date) req.query.date = new Date();
  else req.query.date = new Date(req.query.date);
  const parsedDate = moment(
    req.query.date,
    "YYYY-MM-DD HH:mm:ss.SSS Z"
  ).toDate();
  const startDate = new Date(parsedDate);
  startDate.setHours(startDate.getHours() - req.query.limit);
  console.log(parsedDate);
  console.log(parsedDate.toISOString());
  console.log(startDate);
  console.log(startDate.toISOString());
  if (!isUUID(req.query.id))
    return createResponse(res, 400, {
      id: "device id param format is not valid",
    });

  try {
    query = await db.query(`SELECT
                        "telemetry"."id"
                            FROM
                                "telemetry"
                            WHERE "telemetry"."deviceid" = '${req.query.id}';
                            `);

    data = [];
    temp_data = [];
    for (z = 0; z < query.rows.length; z++) {
      query2 = await db.query(`SELECT
      "telemetry"."name",
      "telemetryhistory"."value",
      "telemetryhistory"."date"
  FROM
      "telemetry"
  INNER JOIN
      "telemetryhistory" ON "telemetry"."id" = "telemetryhistory"."telemetryid"
  INNER JOIN
      "device" ON "telemetry"."deviceid" = "device"."id"
  WHERE "device"."userid" = '${req.user.id}'
  AND "telemetry"."id" = '${query.rows[z].id}'
  AND "telemetryhistory"."date" BETWEEN '${startDate.toISOString()}' AND '${parsedDate.toISOString()}'
  ORDER BY "telemetryhistory"."date" DESC
                            `);
      console.log(`SELECT
      "telemetry"."name",
      "telemetryhistory"."value",
      "telemetryhistory"."date"
  FROM
      "telemetry"
  INNER JOIN
      "telemetryhistory" ON "telemetry"."id" = "telemetryhistory"."telemetryid"
  INNER JOIN
      "device" ON "telemetry"."deviceid" = "device"."id"
  WHERE "device"."userid" = '${req.user.id}'
  AND "telemetry"."id" = '${query.rows[z].id}'
  AND "telemetryhistory"."date" BETWEEN '${startDate.toISOString()}' AND '${parsedDate.toISOString()}'
  ORDER BY "telemetryhistory"."date" DESC
                            `);
      if (query2.rows.length == 0) {
        continue;
      }
      for (x = 0; x < query2.rows.length; x++) {
        temp_data[x] = [query2.rows[x].date, query2.rows[x].value];
      }
      data[z] = { name: query2.rows[0].name, data: temp_data };
      temp_data = [];
    }
    const filteredList = data.filter((item) => item !== null);
    data = filteredList;
    return createResponse(res, 200, {
      list: data,
    });
  } catch (error) {
    console.log(error);
    return createResponse(res, 500, { message: "Internal server error" });
  }
});

module.exports = postRouter;
