const express = require('express')
const {mqttLogger} =require('./src/routes/mqttLogger');
const app = express()

const deviceRouter = require('./src/routes/device');
const telemetryRouter = require('./src/routes/telemetry');

app.use(express.json());
app.use('/device', deviceRouter);
app.use('/telemetry', telemetryRouter);
console.log('test')

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
  console.log('test2')
  

client.on('error', function (error) {
  console.error('Connection failed:', error);
});

client.on('message', function (topic, message) {
    console.log('Received message on topic:', topic, 'with payload:', message.toString());
  });
  
client.subscribe('coba');

app.listen(process.env.PORT || 3000)