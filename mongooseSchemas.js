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
			return;
		}
		// We now should ideally have a clean & valid question object which has been inserted.
		// send back only the required non-sensitive data
		var response = {
			levelNumber: result.levelNumber,
			name: result.name,
			sourceHint: result.sourceHint,
			imageURL: result.imageURL,
			answers: '[(array of ' + result.answers.length + ' answers not dispayed)]'
		};
		apiCallback(null, response);
		return;
	});
};

var deleteQuestion = function(inputLevelNumber, apiCallback){
	var decrementByID = function(err,questionIDs){
		console.log('got my IDS:\n\n');
		console.log(questionIDs);
		apiCallback(null, 'done');
		return;
	};
	waterfall([
		function validateInputs(callback){
			var levelNumber = Number.parseInt(inputLevelNumber);
			if(Number.isSafeInteger(levelNumber) && levelNumber > 0){
				callback(null, levelNumber);
				return;
			}
			else{
				callback(new Error('Invalid \'levelNumber\'.'));
				return;
			}
		},
		function getTotalLevels(levelNumber, callback){
			Question.count({},function(error,result){
				if(error){
					callback(new Error('Could not fetch total count of questions.'));
					return;
				}
				else if(result === 0){
					callback(new Error('Nothing to delete.'));
					return;
				}
				else if(levelNumber > result){
					callback(new Error('Question with given levelNumber('+levelNumber+') does not exist. There are currently only '+ result +' levels.'));
					return;
				}
				else{
					callback(null, levelNumber, result);
					return;
				}
			});
		},
		function findByLevelNumber(levelNumber, totalLevels, callback){
			Question.findOneAndRemove({levelNumber: levelNumber}, function(error, result){
				if(error){
					callback(error);
					return;
				}
				if(!result){
					callback(new Error('Question with given levelNumber('+levelNumber+') does not exist.'));
					return;
				}
				callback(null, result, totalLevels);
				return;
			});
		},
		function decrementSuccessiveLevels(deleted, totalLevels, callback){
			//just return for now
			if(deleted.levelNumber === totalLevels){
				//if the last level got deleted - nothing to decrement.
				callback(null, deleted);
				return;
			}
			//else we have to decrement from deleted.levelNumber+1 to totalLevels
			var questionsToDelete = Question
				.find({ levelNumber: { $gt: deleted.levelNumber, $lte: totalLevels} })
				.sort({ levelNumber: 1 })
				.select({ _id: 1});

			questionsToDelete.exec(decrementByID);

			callback(null, deleted);
			return;
		}
	],
	function finalCallback(error, result){
		if(error){
			apiCallback(error, null);
			return;
		}
	});
};

var readAllQuestions = function(apiCallback){
	Question
	.find({})
	.sort({levelNumber:1})
	.exec(function(error,result){
		if(error){
			apiCallback(error, null);
			return;
		}
		else{
			apiCallback(null, result);
			return;
		}
	});
};

var readQuestionByLevelNumber = function(levelNumber, apiCallback){
	Question
	.findOne({ levelNumber: levelNumber })
	.exec(function(error,result){
		console.log(result);
		if(error){
			apiCallback(error, null);
			return;
		}
		else if(!result){
			apiCallback(new Error('Could not find question with that level number'), null);
			return;
		}
		else{
			apiCallback(null, result);
			return;
		}
	});
};

/* Exports */
module.exports.Schema = {};
module.exports.Schema.user = user;

module.exports.User = User;
module.exports.Question = Question;

module.exports.newQuestion = newQuestion;
module.exports.deleteQuestion = deleteQuestion;
module.exports.readAllQuestions = readAllQuestions;
module.exports.readQuestionByLevelNumber = readQuestionByLevelNumber;










