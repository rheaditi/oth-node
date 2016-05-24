'use strict';

var mongoose = require('mongoose');

/* Just to make it shorter =P */
var Schema = mongoose.Schema;
var Model = mongoose.model.bind(mongoose);

/* Base Schemas */
var user = Schema({
	name: { 
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true,
		default: 'hunter'
	}
	username: {
		type: String, 
		required: true, 
		unique: true
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
		type: Date
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
		type: String,
		default: 'TRUSTED'
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
		type: 
	}
});

/* Methods */

user.methods.show = function(){
	console.log('User Details:\nusername: '+this.username+'\naffiliation: '+this.affiliation+'\n');
}

/* Models */

var User = Model('User', user);


/* Exports */
module.exports.Schema = {};
module.exports.Schema.user = user;

module.exports.User = User;