'use strict';
const Alexa = require("alexa-sdk");
const https = require('https');

var username = process.env.user;
var password = process.env.pwd;
var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function getHomeData(dataPoint, callback) {
    var url = encodeURI('/skill_server/?datapoint='+dataPoint);
    console.log("url: "+url);
    https.get({
            host: 'dh-home.ddnss.de',
            encoding: "utf8",
            path: url,            
            auth:username+":"+password
        },
         function(response) {
            // Continuously update stream with data
            console.log("response: "+response+ "code: "+response.statusCode)
            if(response.statusCode != 200) {
                callback({
                    jsonResponse: "error"
                });
                return;
            } 
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                // Data reception is done, do whatever with it!
                console.log("respone "+body);
                var jsonResponse = JSON.parse(body);
                
                callback({
                    jsonResponse: jsonResponse
                });
            });
    });
}

var handlers = {
    'LaunchRequest': function () {
        this.emit('Du sprichst mit Deinem zuhause.');
    },
    'GetOutsideTemp': function () {
        getHomeData("Heating_Outside_Temperature", function(jsonResponse) {
            console.log('got: '+JSON.stringify(jsonResponse));
            var temperature = jsonResponse.jsonResponse.Heating_Outside_Temperature;
            this.emit(':tell','Draussen sind '+temperature+' Grad');
        });
    },
    
};

getHomeData("power_current", function(jsonResponse) {
            console.log('got: '+JSON.stringify(jsonResponse));
});