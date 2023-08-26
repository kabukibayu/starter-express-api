const mosca = require('mosca');
const {mqttLogger} =require('../routes/mqttLogger');

const mqttSettings = {
  port: 1883, 
  http: {
    port: 3000, 
    bundle: true,
    static: './',
  },
};
const mqttServer = new mosca.Server(mqttSettings);

mqttServer.on('ready', () => {
  console.log('MQTT broker is up and running');
});

mqttServer.on('clientConnected', (client) => {
  console.log('Client connected:', client.id);
});

mqttServer.on('published', (packet, client) => {
  console.log('Message received:', packet.payload.toString());

  const parsedData = JSON.parse(packet.payload.toString());

  mqttLogger(parsedData);

});
