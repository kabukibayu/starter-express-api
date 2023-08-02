const express = require('express')
const mosca = require('mosca');
const {mqttLogger} =require('./src/routes/mqttLogger');
const app = express()

const deviceRouter = require('./src/routes/device');
const telemetryRouter = require('./src/routes/telemetry');

app.use(express.json());
app.use('/device', deviceRouter);
app.use('/telemetry', telemetryRouter);

// MQTT broker settings
const settings = {
    port: 1883, // MQTT broker port
  };
  
  const mqttBroker = new mosca.Server(settings);
  
  mqttBroker.on('ready', () => {
    console.log('MQTT broker is up and running');
  });
  
  mqttBroker.on('clientConnected', (client) => {
    console.log(`Client connected: ${client.id}`);
  });
  
  mqttBroker.on('published', (packet) => {
    console.log('Message received:', packet.payload.toString());
  
    const parsedData = JSON.parse(packet.payload.toString());
  
    mqttLogger(parsedData);
  
  });

app.listen(process.env.PORT || 3000)