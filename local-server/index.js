'use strict'

const mqtt = require('mqtt');
const http = require('http');
const url = require('url');
const auth = require('basic-auth')

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
  var user = process.argv[2];
  var pwd = process.argv[3];
  var credentials = auth(request);

  if (!credentials || credentials.name !== user || credentials.pass !== pwd) {
    response.statusCode = 401;
    response.setHeader('WWW-Authenticate', 'Basic realm="example"');
    response.end('Access denied');
  } else {
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
  }
});

if(!process.argv || process.argv.length < 4)
  process.exit(-1);

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
