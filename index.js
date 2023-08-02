const express = require('express')
const {mqttLogger} =require('./src/routes/mqttLogger');
const app = express()

const deviceRouter = require('./src/routes/device');
const telemetryRouter = require('./src/routes/telemetry');

app.use(express.json());
app.use('/device', deviceRouter);
app.use('/telemetry', telemetryRouter);

// For Node.js environment
var mqtt = require('mqtt')

var options = {
    host: '6b946a781fc1457b9987f4d75283ecf2.s2.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'jarex',
    password: '12345678'
}

var client = mqtt.connect(options);
  
  client.on('connect', () => {
    console.log('Connected')
  })
  

client.on('error', function (error) {
  console.error('Connection failed:', error);
});

client.on('message', function (topic, message) {
  console.log('Message received:', message.toString());
  
  const parsedData = JSON.parse(message.toString());

  mqttLogger(parsedData);
  });
  
client.subscribe('telemetry/post');

app.listen(process.env.PORT || 3000)