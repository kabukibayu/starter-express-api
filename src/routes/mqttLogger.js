const { db } = require('../config/database');
require('dotenv').config();

async function deviceCheckByDeviceToken(deviceToken) {
  const queryResult = await db.query(`SELECT "id" FROM "device" WHERE "token" = $1;`, [deviceToken]);
  return queryResult.rows;
}


async function logData(deviceID, TelemetryName, telemetryValue) {
    try {
      const currentTimestamp = Date.now();
  
      const selectQuery = `
        SELECT "id", "latestupdated" 
        FROM "telemetry" 
        WHERE "deviceid" = $1 AND "name" = $2;`;
  
      const selectResult = await db.query(selectQuery, [deviceID, TelemetryName]);
  
      if (selectResult.rows.length === 0) {
        // Telemetry entry not found, insert new record
        const insertQuery = `
          INSERT INTO "telemetry" ("deviceid", "name", "latestupdated")
          VALUES ($1, $2, to_timestamp($3 / 1000.0))
          RETURNING "id";`;
  
        const insertResult = await db.query(insertQuery, [deviceID, TelemetryName, currentTimestamp]);
  
        const telemetryId = insertResult.rows[0].id;
  
        const insertHistoryQuery = `
          INSERT INTO "telemetryhistory" ("telemetryid", "value", "date")
          VALUES ($1, $2, to_timestamp($3 / 1000.0));`;
  
        await db.query(insertHistoryQuery, [telemetryId, telemetryValue, currentTimestamp]);
      } else {
        // Telemetry entry found, update existing record
        const telemetryId = selectResult.rows[0].id;
  
        const updateQuery = `
          UPDATE "telemetry"
          SET "latestupdated" = to_timestamp($1 / 1000.0)
          WHERE "id" = $2;`;
  
        await db.query(updateQuery, [currentTimestamp, telemetryId]);
  
        const insertHistoryQuery = `
          INSERT INTO "telemetryhistory" ("telemetryid", "value", "date")
          VALUES ($1, $2, to_timestamp($3 / 1000.0));`;
  
        await db.query(insertHistoryQuery, [telemetryId, telemetryValue, currentTimestamp]);
      }
  
      console.log("MASUK!");
    } catch (error) {
      console.log(error);
      // Handle error here if necessary
    }
  }
  

const mqttLogger = async (parsedData) => {
  
  for (const key in parsedData) {
   
    if (key === "data" && typeof parsedData[key] === "object") {
      for (const nestedKey in parsedData[key]){
         console.log(`key ${nestedKey}: ${parsedData[key][nestedKey]}`);
         console.log(!(!deviceid[0].id))
        if(!(!deviceid[0].id)){await logData(deviceid[0].id, nestedKey, parsedData[key][nestedKey])}
      }
    } else {
        deviceid = await deviceCheckByDeviceToken(parsedData[key]);
      console.log(`${key}: ${parsedData[key]}`);
      
      if (deviceid.length === 0) break;
    }
  }
}

module.exports = {mqttLogger};
