var express = require('express');
var app = express();

var persistence = require('./persistence');

app.use(express.static(__dirname + '/../public'));




module.exports = app;
