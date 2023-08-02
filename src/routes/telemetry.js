const postRouter = require('express').Router();
const { createResponse } = require('../utils/response');
const { db } = require('../config/database');
const { isUUID } = require('../utils/utility');
require('dotenv').config();

postRouter.post('/post', async (req, res) => {
    try {
        const {deviceID, deviceToken, TelemetryName, telemetryValue} = req.body;
        if(!isUUID(deviceID)) return createResponse(res, 400, 'Device ID is not valid');
        if (!TelemetryName) return createResponse(res, 400, 'Telemetry name cant be empty');
        if (!telemetryValue) return createResponse(res, 400, 'Telemetry value cant be empty');

        await db.query(`SELECT "Token" FROM "Device" WHERE "ID"= '${deviceID}';`
            ).then((query) => {
               if(query.rows.length < 1) return createResponse(res, 400, 'Device Not Found');
               if(deviceToken != query.rows[0].Token) return createResponse(res, 400, 'Token is not valid');
            }).catch(async (error) => {
            console.log(error);
            return createResponse(res, 500, { message: 'Internal server error' });
            })
        
        await db.query(`
            SELECT "ID", "LatestUpdated" FROM "Telemetry" WHERE "DeviceID"= '${deviceID}' AND "Name"= '${TelemetryName}';`
            ).then(async (query) => {
            var telemetryId;
            var currentTimestamp = Date.now()
               if(!query.rows.length > 0) {
                    await db.query(`
                        INSERT INTO "Telemetry" ("DeviceID", "Name", "LatestUpdated")
                        VALUES ('${deviceID}', '${TelemetryName}', 'to_timestamp(${currentTimestamp} /1000.0))
                        RETURNING "ID"`).then((query) => {
                            telemetryId = query.rows[0].ID;
            }).catch(async (error) => {
                console.log(error);
                return createResponse(res, 500, {message: 'Internal server error' });
                })
            }else{
                telemetryId = query.rows[0].ID;
                await db.query(`
                        UPDATE "Telemetry"
                        SET "LatestUpdated"= to_timestamp(${currentTimestamp} /1000.0)
                        WHERE "ID"= '${telemetryId}'`).then((query) => {
                            
            }).catch(async (error) => {
                console.log(error);
                return createResponse(res, 500, { message: 'Internal server error' });
                })}    
            await db.query(`
                    INSERT INTO "TelemetryHistory" ("TelemetryID", "Value", "Date")
                    VALUES ('${telemetryId}', '${telemetryValue}', to_timestamp(${currentTimestamp} /1000.0))`).then(() => {
                        return createResponse(res, 200, { message: 'Post successful' });
            })
            })
        }catch (error) {
        console.log(error);
        return createResponse(res, 500, { message: 'Internal server error' });
    }
})

postRouter.get('/get-latest', async (req, res) => {
    try {
        await db.query(`
        SELECT "telemetry"."id", "telemetry"."deviceid", "telemetry"."name", "telemetry"."created", "telemetry"."latestupdated", "telemetryhistory"."value"
        FROM "telemetry" 
        INNER JOIN "telemetryhistory" 
        ON "telemetry"."id" = "telemetryhistory"."telemetryid" 
        AND "telemetry"."latestupdated" = "telemetryhistory"."date";`
            ).then((query) => {
                console.log(query.rows);
            return createResponse(res, 200, { message: {
                list: query.rows,
            } });
        }).catch(async (error) => {
            console.log(error);
            return createResponse(res, 500, { message: 'Internal server error' });
            })
        }
     catch (error) {
        console.log(error);
        return createResponse(res, 500, { message: 'Internal server error' });
    }
})

postRouter.get('/get-log', async (req, res) => {
   
        return createResponse(res, 200, { message: {
            "Suhu" : "PANAS CUK"
        }
})})


module.exports = postRouter;