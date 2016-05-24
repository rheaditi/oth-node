var express = require('express');
var app = express();

require('./config/localDbConnect.js');
var db = require('./mongooseSchemas.js');

app.set('port', 3000);

var testUser = new db.User({username:'bianca', affiliation:'kolkata'});

testUser.save(function (err, testUser) {
  if (err) return console.error(err);
  console.log('in save:\n');
  testUser.show();
});



db.User.find(function (err, users) {
  if (err) return console.error(err);
  console.log('All Users Now:\n\n');
  console.log(users);
})

// app.get('/', function(request, response){
// 	response.send('Home');
// });

// app.listen(app.get('port'), function(){
// 	console.log('localhost:3000');
// });