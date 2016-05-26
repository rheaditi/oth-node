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

/* Models */

var User = Model('User', user);
var Question = Model('Question', question);


/* Schema Methods */

user.methods.logDetails = function(){
	console.log("Logging details of user %s:\n\tusername: %s,\n\trole: %s,\n\tupdated: %s,\n\tcreated: %s,\n\tcurrent level: %s,\n\tflag: %s\n", this.name, this.username, this.role, this.updated, this.created, this.level.levelNumber, this.flag.status);
}

/* Helper Functions - Internal Use */


/* Helper Functions - Exported */

var newQuestion = function(inputQuestion) {
	// validate question before creating a new object
	waterfall([
		function isUniqueQuestionName(callback){
			var question = inputQuestion;
			Question.findOne({name: question.name}, function(error, result){
				if(error){
					callback(new Error('Retreiving question by name: '+String(error)));
					return;
				}
				else if(result){
					callback(new Error('Question with given name ('+ result.name +') already exists.'));
					return;
				}
				callback(null, question);
				return;				
			});
		},
		function isUniqueImageURL(question, callback){
			Question.findOne({imageURL: question.imageURL}, function(error, result){
				if(error){
					callback(new Error('Retreiving question by imageURL: '+String(error)));
					return;
				}
				else if(result){
					callback(new Error('Question with given imageURL ('+ result +') already exists.'));
					return;
				}
				callback(null, question);
				return;				
			});
		},
		function(question, callback){
				
			callback(null, question);
		}
	],
	function finalCallback(error, result){
		if(error){
			throw error;			
		}
		console.log('After waterfall result:\n');
		console.log(result);
	}
	);
};


/* Exports */
module.exports.Schema = {};
module.exports.Schema.user = user;

module.exports.User = User;
module.exports.Question = Question;

module.exports.newQuestion = newQuestion;