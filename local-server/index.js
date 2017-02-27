'use strict'

const mqtt = require('mqtt');
const http = require('http');
const url = require('url');

var mqttValues = new Map();

//mqtt handling
var client  = mqtt.connect('mqtt://pi.home')

client.on('connect', function () {
  client.subscribe('#');
});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic +" "+message.toString());
  var indexOfSlash = topic.lastIndexOf("/");
  if(indexOfSlash > -1) {
      var item = topic.substring(indexOfSlash+1);
      var value = message.toString();
      mqttValues.set(item,value);
  }
});


// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  var queryData = url.parse(request.url, true).query;
  console.log(queryData);
  if(queryData.datapoint && mqttValues.has(queryData.datapoint)) {
    console.log(mqttValues.get(queryData.datapoint)+" "+queryData.datapoint);
    var result = {};
    result[queryData.datapoint] = mqttValues.get(queryData.datapoint);
    response.end(JSON.stringify(result));
  }
  response.end("{}");
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
