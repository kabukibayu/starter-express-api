const express = require('express')
const { createResponse } = require('./src/utils/response');
const app = express()

const deviceRouter = require('./src/routes/device');
const telemetryRouter = require('./src/routes/telemetry');

app.use(express.json());
app.use('/device', deviceRouter);
app.use('/telemetry', telemetryRouter);

app.listen(process.env.PORT || 3000)