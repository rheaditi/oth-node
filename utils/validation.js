'use strict';

/* RE for different entities */
var message = {};
var expression = {};
expression.username = new RegExp(/^[a-z\d_]{3,20}$/);
message.username = 'Only lowercase letters(a-z), digits(0-9) and underscores(_). Between 3 and 20 characters.';

expression.name = new RegExp(/^[a-zA-Z]+([\s][a-zA-Z]+)*$/);
message.username = 'Only letters(A-Z or a-z) and separated by whitespace. No special characters.';

expression.levelName = new RegExp(/^[A-Za-z0-9]+([-]?[A-Za-z0-9]+)*$/);
message.levelName = 'Case-sensitive. Only letters letters(A-Z or a-z), digits(0-9) and hyphen(-). No whitespace or special characters. Cannot end with a hyphen.';

expression.htmlTags = new RegExp(/(<([^>]+)>)/ig);

/* Validation Utils - returns true or false only */
var validate = {};
validate.username = function(input){
	return expression.username.test(input);
};

validate.name = function(input){
	return expression.name.test(input);
};

validate.levelName = function(input){
	return expression.levelName.test(input);
};

validate.stripHtml = function(input){
	input = input.replace(expression.htmlTags,"");
	return input;
};


module.exports = validate;




