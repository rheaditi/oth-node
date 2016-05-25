'use strict';

var mongoose = require('mongoose');
var waterfall = require("async/waterfall");

/* Just to make it shorter =P */
var Schema = mongoose.Schema;
var Model = mongoose.model.bind(mongoose);

/* Base Schemas */
var user = Schema({
	name: { 
		type: String,
		required: true
	},
	username: {
		type: String, 
		required: true, 
		unique: true
	},
	role: {
		type: String,
		required: true,
		default: 'hunter'
	},
	affiliation: {
		type: String,
		required: true
	},
	updated: { 
		type: Date, 
		default: Date.now
	},
	created: {
		type: Date,
		required: true
	},
	level: {
		levelNumber: {
			type: Number,
			required: true
		},
		timeStamp: {
			type: Date,
			default: Date.now
		}
	},
	flag: {
		status: {
			type: String,
			default: 'TRUSTED', //CHEATER ETC
		},
		incidents: [String]
	}
});

var question = Schema({
	levelNumber: {
		type:Number,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true,
		unique: true
	},
	sourceHint: {
		type: String
	},
	imageURL: {
		type: String,
		required: true,
		unique: true
	},
	answers: [{
		type: String,
		unique: true
	}] 
});

/* Schema Methods */

user.methods.logDetails = function(){
	console.log("Logging details of user %s:\n\tusername: %s,\n\trole: %s,\n\tupdated: %s,\n\tcreated: %s,\n\tcurrent level: %s,\n\tflag: %s\n", this.name, this.username, this.role, this.updated, this.created, this.level.levelNumber, this.flag.status);
}

/* Helper Functions - Internal Use */

var isUniqueQuestion = function(error, ){

};

/* Helper Functions - Exported */

var newQuestion = function(inputQuestion) {
	// validate question before creating a new object

};

/* Models */

var User = Model('User', user);
var Question = Model('Question', user);

/* Exports */
module.exports.Schema = {};
module.exports.Schema.user = user;

module.exports.User = User;
module.exports.Question = Question;