
var express = require('express');
var app = express();
var open = require('open');
// static content
app.use(express.static('web'));

var server = app.listen(8080, function () {
	// open the browser
	open('http://localhost:8080/');
});

module.exports = app;
