const html = __dirname + '/dist';
const prefsFile = "prefs.json";

const port = 4003;

// Express
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const request = require('request');
const async = require('async');
var app = express();

var username = "locked";

app
	.use(compression())
	.use(bodyParser.json())
	.use(express.static(html))
	.use(cookieParser())
	.listen(port, function () {
		console.log("webserver started on port " + port);
	});

var auth = function (req, res, next) {
	if (req.cookies.supremeuser == username)
		next();
	else
		res.sendStatus(401);
};


function loadFile(fileName) {
	try {
		const jsonString = fs.readFileSync(fileName, 'utf8');
		const data = JSON.parse(jsonString);
		return data;
	} catch (err) {
		return null;
	};
}

function saveFile(fullFileName, data) {
	var formattedJson = JSON.stringify(data, null, 2);
	fs.writeFileSync(fullFileName, formattedJson);
}

username = loadFile(prefsFile).password;
