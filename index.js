var http = require('http');
var Promise = require('bluebird');
var axios = require('axios');

var dbConnection = axios.create({});
var SERVICE_DEMO_ENVIRONMENT_NAME = 'demo';
var SERVICE_DEVELOPMENT_ENVIRONMENT_NAME = 'dev';
var SERVICE_PRODUCTION_ENVIRONMENT_NAME = 'production';
var SERVICE_DOMAIN_PROTOCOL = 'http://';
var ENVIRONMENT = process.argv[2];
var SERVICE_DOMAIN = getDomain(ENVIRONMENT);
var SERVICE_PORT = ':9000/';
var SERVICE_ENDPOINT = SERVICE_DOMAIN_PROTOCOL + SERVICE_DOMAIN + SERVICE_PORT;

function getDomain(possibleEnvironmentArgument) {
  // TODO: This is the right approach to reading the environmental variables
  /*if (possibleEnvironmentArgument === SERVICE_DEMO_ENVIRONMENT_NAME) {
    return '52.6.203.39';
  } else if (possibleEnvironmentArgument === SERVICE_DEVELOPMENT_ENVIRONMENT_NAME) {
    return 'localhost';
  }
  return '52.202.139.253';*/
  // TODO: This will be removed and replaced by the prevous approach whenever we go to production 
  if (possibleEnvironmentArgument === SERVICE_PRODUCTION_ENVIRONMENT_NAME) {
    return '52.202.139.253';
  } else if (possibleEnvironmentArgument === SERVICE_DEVELOPMENT_ENVIRONMENT_NAME) {
    return 'localhost';
  }
  return '52.6.203.39';
};

function checkHealthServerStatus() {
  return new Promise(function(fulfill, reject) {
    dbConnection.get(SERVICE_ENDPOINT, {
      data: {},
    })
    .then(function() {
      fulfill();
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

function handleRequest(request, response) {
  response.setHeader('Content-Type', 'application/json');
  checkHealthServerStatus()
    .then(function() {
      response.end(JSON.stringify({
        status: 200,
        messaje: 'Ok',
      }));
    })
    .catch(function(error) {
      console.log(error);
      response.end(JSON.stringify({
        method: request.method,
        status: 503,
        messaje: 'Service unavailable',
        reuqest_headers: request.headers,
      }));
    });
};

const PORT = 8080;

var server = http.createServer(handleRequest);

server.listen(PORT, function() {
  console.log('Server listening on: http://localhost:%s', PORT);
  console.log('Pointing to: ' + (ENVIRONMENT || SERVICE_DEMO_ENVIRONMENT_NAME) + ' on ' + SERVICE_ENDPOINT);
});
