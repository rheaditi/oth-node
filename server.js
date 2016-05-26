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
var logger = expressWinston.logger({
	transports: [
		new winston.transports.Console({
			colorize: true,
			timestamp: true
		}),
		new winston.transports.File({
			colorize: false,
			timestamp: true,
			filename: './logs/winston.log',
			maxsize: 1024,
			zippedArchive: true
		})
	],
	msg: '{{res.statusCode}} HTTP {{req.method}} {{res.responseTime}}ms {{req.url}}',
	meta: false, // optional: control whether you want to log the meta data about the request (default to true)
});
app.use(logger);

/* Custom Module Loading */
require('./config/localDbConnect.js');
var db = require('./mongooseSchemas.js');
var validate = require('./utils/validation.js');

/* Backend APIS */
app.post('/api/questions', function(request, response){
	db.newQuestion(request.body, function(error, question){
		if(error){
			// 400 Bad Request - The request was invalid or cannot be served.
			response.status(400).send(error.message);
		}
		else{
			// 201 Created - request fulfilled, resulting in the creation of a new resource.
			response.status(201).json(question);
		}		
	});
});

app.delete('/api/questions', function(request, response){
	response.status(403).send('Server does not support deleting all question resources. Too risky, man!');
});

app.delete('/api/questions/:levelNumber', function(request, response){
	response.send("I think you're tring to delete question with level number = " + request.params.levelNumber);
});

/* Finally up server on specified port and listen for connections */
app.set('port', 3000);
app.listen(app.get('port'), function(){
	console.log('localhost:3000');
});