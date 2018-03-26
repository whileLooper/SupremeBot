const HTML = __dirname + '/droplist-filler-app/dist';
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

app.get('/api/products', function (req, res) {
	getProducts((products) => {
		console.log(products);
		res.send(products);
	});
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
		const baseUrl = 'https://www.supremecommunity.com';
		const newProduct = {
			id : $(this).attr('data-itemid'),
			name : $(this).find('.name.item-details').text(),
			imageUrl : baseUrl+$(this).find('img').attr('src'),
			price : parseInt($(this).find('.label-price').text().trim().split('/')[0]),
			votePositive : parseInt($(this).find('.progress-bar-success').text()),
			voteNegative : parseInt($(this).find('.progress-bar-danger').text())
		}
		products.push(newProduct);
	});
	return products;
}

username = jsonfile.readFileSync(PREFS_FILE).password;
