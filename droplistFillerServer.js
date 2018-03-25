const HTML = __dirname + 'droplist-filler-app/dist';
const PREFS_FILE = "prefs.json";
const PORT = 4003;
const SUPREME_COMMUNITY_URL = "https://www.supremecommunity.com/season/spring-summer2018/droplist/2018-03-22/";

// Express
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const cheerio = require('cheerio');
var request = require('request-promise');
const async = require('async');
const jsonfile = require('jsonfile');
var app = express();

var username = "locked";

app
	.use(compression())
	.use(bodyParser.json())
	.use(express.static(HTML))
	.use(cookieParser())
	.listen(PORT, function () {
		console.log("webserver started on port " + PORT);
	});

var auth = function (req, res, next) {
	if (req.cookies.supremeuser == username)
		next();
	else
		res.sendStatus(401);
};

app.get('/products', function (req, res) {
	var trainingArray = _.values(trainings);
	getProducts((products) => res.send(products));
});

function getProducts(callback) {
	request(SUPREME_COMMUNITY_URL)
		.then(function (htmlString) {
			callback (parseProducts(htmlString));
		})
		.catch(function (err) {
			callback(null);
		});
}

function parseProducts(htmlString) {
	const $ = cheerio.load(htmlString);
	var products = [];
	$('.card').each ( function (index, element) {
		const newProduct = {
			id : $(this).attr('data-itemid'),
			imageUrl : $(this).find('img').attr('src'),
			price : $(this).find('.label-price').text().trim(),
			votePositive : $(this).find('.progress-bar-success').text(),
			voteNegative : $(this).find('.progress-bar-danger').text()
		}
		products.push(newProduct);
	});
	return products;
}

username = jsonfile.readFileSync(PREFS_FILE).password;

getProducts ( (value)=> console.log(value));
