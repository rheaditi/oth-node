'use strict';

var mongoose = require('mongoose');
var waterfall = require('async/waterfall');
var validate = require('./utils/validation.js');
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

var newQuestion = function(inputQuestion, apiCallback) {
	// validate question and then add the new question to database
	waterfall([
		function validateInputs(callback){
			var question = inputQuestion;
			if(validate.levelName(inputQuestion.name) != true){
				callback(new Error('Invalid level name. ' + validate.message.levelName));
				return;
			}
			question.sourceHint = validate.stripHtml(question.sourceHint);
			callback(null, question);
			return;
		},
		function isUniqueQuestionName(question, callback){
			Question.findOne({name: question.name}, 'name', function(error, result){
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
			Question.findOne({imageURL: question.imageURL}, 'imageURL', function(error, result){
				if(error){
					callback(new Error('Retreiving question by imageURL: '+String(error)));
					return;
				}
				else if(result){
					callback(new Error('Question with given imageURL ('+ result.imageURL +') already exists.'));
					return;
				}
				callback(null, question);
				return;				
			});
		},
		function answersToValidArray(question, callback){
			var answerArray = question.answers.split(',');
			answerArray = answerArray.filter(function(answer){
				return answer.length > 0;
			});
			for(var i in answerArray){
				answerArray[i] = answerArray[i].toLowerCase();
			}
			if(answerArray.length < 1 || answerArray.length > 30){
				callback(new Error('There is something wrong with the list of answers for this question.'));
				return;
			}
			question.answers = answerArray;
			callback(null, question);
		},
		function getLevelNumber(question, callback){
			Question.count({}, function(error, result){
				if(error){
					callback(error);
					return;
				}
				question.levelNumber = result + 1;
				callback(null, question);
			});			
		},
		function addValidQuestionToDB(question, callback){
			Question.create(question, function(error, result){
				if(error){
					callback(error);
					return;
				}
				callback(null, result);
			});
		}
	],
	function finalCallback(error, result){
		if(error){
			apiCallback(error, null);
		}
		// We now should ideally have a clean & valid question object which has been inserted.
		apiCallback(null, result);
	}
	);
};


/* Exports */
module.exports.Schema = {};
module.exports.Schema.user = user;

module.exports.User = User;
module.exports.Question = Question;

module.exports.newQuestion = newQuestion;