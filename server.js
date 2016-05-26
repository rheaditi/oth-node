'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

/* Serve Static Files at Root */
app.use('/', express.static(__dirname + '/public'));

/* Enable population of request.body for '/api' routes only - all other routes, unless using middleware explicitly will have request.body as undefined */
app.use('/api', bodyParser.json()); // for parsing application/json
app.use('/api', bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/* Middleware object for use on certain routes (if required) */
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: true });

/* Custom Module Loading */
require('./config/localDbConnect.js');
var db = require('./mongooseSchemas.js');
var validate = require('./utils/validation.js');



db.newQuestion({ name: 'hello', levelNumber: 3, sourceHint: 'source3', imageURL: 'image2', answers: ['answer31', 'answer32'] });

app.post('/api/question', function(request, response){
	console.log(request.body);
	response.json(request.body);
});


/* Finally up server on specified port and listen for connections */
app.set('port', 3000);
app.listen(app.get('port'), function(){
	console.log('localhost:3000');
});