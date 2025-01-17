const postRouter = require('express').Router();
const { createResponse } = require('../utils/response');
const { db } = require('../config/database');
const { generateToken } = require('../utils/utility');
require('dotenv').config();

postRouter.post('/create', async (req, res) => {
    try {
        const { deviceName } = req.body;
        if (!deviceName) return createResponse(res, 400, {'deviceName' : 'Device name cant be empty'});
        const token = generateToken(32);
        await db.query(`
            INSERT INTO "device" ("name", "token", "userid")
            VALUES ('${deviceName}', '${token}', '${req.user.id}')
        `).then(() => {
            return createResponse(res, 200, { message: 'Post successful' });
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

postRouter.get('/get', async (req, res) => {
    try {
        console.log(req.user)
        await db.query(`
            SELECT "id", "name", "token", "created", "latestupdated"
            FROM "device"
            WHERE "userid" = '${req.user.id}'`
            ).then((query) => {
            return createResponse(res, 200, { 
                list: query.rows,
            } );
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

module.exports = postRouter;