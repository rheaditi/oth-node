'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();

/* Serve Static Files at Root */
app.use('/', express.static(__dirname + '/public'));

/* Enable population of request.body for '/api' routes only - all other routes, unless using middleware explicitly will have request.body as undefined */
app.use('/api', bodyParser.json()); // for parsing application/json
app.use('/api', bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/* Middleware object for use on certain routes (if required) */
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: true });

/* Logging middleware express-winston setup */
// Log HTTP Requests
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: true,
      timestamp: true,
      meta: false
    }),
    new winston.transports.File({
    	timestamp: true,
    	filename: './logs/winston.log',
    	maxsize: 1024,
    	zippedArchive: true
    })
  ]//,
  // expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
  // colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
}));

/* Custom Module Loading */
require('./config/localDbConnect.js');
var db = require('./mongooseSchemas.js');
var validate = require('./utils/validation.js');

/* Backend APIS */
app.post('/api/questions', function(request, response){
	db.newQuestion(request.body, function(error, question){
		if(error){
			response.send(error.message);
		}
		else{
			response.send(question);
		}		
	});
});


/* Finally up server on specified port and listen for connections */
app.set('port', 3000);
app.listen(app.get('port'), function(){
	console.log('localhost:3000');
});