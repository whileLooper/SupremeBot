const HTML = __dirname + '/droplist-filler-app/dist';
const PREFS_FILE = "prefs.json";
const DROPLIST_FILE = "droplist.json";
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
		res.send(products);
	});
});

app.get('/api/images', function (req, res) {
	getImages(req.query.id, (images) => {
		console.log(images);
		res.send(images);
	})
});

app.get('/api/droplist', function (req, res) {
	res.send(getDropList());
});

function getDropList () {
	const droplist = jsonfile.readFileSync(DROPLIST_FILE);
	return droplist
}

app.post('/api/droplist', function (req, res) {
	saveInDroplist (req.body);
	res.send({'success':true});
});

function saveInDroplist (droplist) {
	jsonfile.writeFileSync(DROPLIST_FILE, droplist, {spaces: 4, EOL: '\n'});
}

function getImages(productId, callback) {
	const baseUrl = 'https://www.supremecommunity.com/season/itemdetails/';
	console.log(baseUrl+productId);
	request(baseUrl+productId)
		.then(function (htmlString) {
			callback(parseImages(htmlString));
		})
		.catch(function (err) {
			callback(null);
		});
}

function parseImages (htmlString) {
	const $ = cheerio.load(htmlString);
	var images = [];
	$('#thumbcarousel .item > div').each(function (index, element) {
		const baseUrl = 'https://www.supremecommunity.com';
		const url = baseUrl + $(this).attr('data-image-hq');
		images.push(url);
	});
	return images;
}

function getProducts(callback) {
	request(SUPREME_COMMUNITY_URL)
		.then(function (htmlString) {
			callback(parseProducts(htmlString));
		})
		.catch(function (err) {
			callback(null);
		});
}

function parseProducts(htmlString) {
	const $ = cheerio.load(htmlString);
	var products = [];
	$('.card').each(function (index, element) {
		const baseUrl = 'https://www.supremecommunity.com';
		const newProduct = {
			id: $(this).find('.card-details').attr('data-itemid'),
			name: $(this).find('.name.item-details').text(),
			imageUrl: baseUrl + $(this).find('img').attr('src'),
			price: $(this).find('.label-price').text().trim().split('/')[0],
			votePositive: parseInt($(this).find('.progress-bar-success').text()),
			voteNegative: parseInt($(this).find('.progress-bar-danger').text())
		}
		console.log(newProduct);
		products.push(newProduct);
	});
	return products;
}

username = jsonfile.readFileSync(PREFS_FILE).password;
