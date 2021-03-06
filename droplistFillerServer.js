const HTML = __dirname + '/droplist-filler-app/dist';
const PREFS_FILE = "prefs.json";
const DROPLIST_FILE = "droplist.json";
const PORT = 4003;
const SUPREME_COMMUNITY_BASE_URL = "https://www.supremecommunity.com";
const SUPREME_COMMUNITY_SEASON_URL = SUPREME_COMMUNITY_BASE_URL + "/season/" + (new Date().getMonth() > 6 ? 'fall-winter' : 'spring-summer') + new Date().getFullYear();
const SUPREME_PRODUCTS_URL = "https://www.supremenewyork.com/mobile_stock.json";

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
	if (req.cookies.supremeUser == username)
		next();
	else
		res.sendStatus(401);
};

app.get('/api/products', auth, function (req, res) {
	const week = req.query.week;
	if (week == 0) {
		getCurrentProducts(products => {
			res.send(products);
		});
	} else {
		getProducts(week, (products) => {
			res.send(products);
		});
	}
});

app.get('/api/images', auth, function (req, res) {
	getImages(req.query.id, (images) => {
		res.send(images);
	})
});

app.get('/api/droplist', auth, function (req, res) {
	res.send(getDropList());
});

function getDropList() {
	const droplist = jsonfile.readFileSync(DROPLIST_FILE);
	return droplist
}

app.post('/api/droplist', auth, function (req, res) {
	saveInDroplist(req.body);
	res.send({ 'success': true });
});

function saveInDroplist(droplist) {
	jsonfile.writeFileSync(DROPLIST_FILE, droplist, { spaces: 4, EOL: '\n' });
}

function getImages(productId, callback) {
	const baseUrl = SUPREME_COMMUNITY_BASE_URL + '/season/itemdetails/';
	request(baseUrl + productId)
		.then(function (htmlString) {
			callback(parseImages(htmlString));
		})
		.catch(function (err) {
			callback(null);
		});
}

function parseImages(htmlString) {
	const $ = cheerio.load(htmlString);
	var images = [];
	$('#thumbcarousel .item > div').each(function (index, element) {
		const url = SUPREME_COMMUNITY_BASE_URL + $(this).attr('data-image-src');
		images.push(url);
	});
	return images;
}

function getWeekUrl(week, callback) {
	const droplistsUrl = SUPREME_COMMUNITY_SEASON_URL + '/droplists/';
	request(droplistsUrl)
		.then(function (htmlString) {
			const $ = cheerio.load(htmlString);
			const url = $(htmlString).find('.droplistSelection a.block').eq(week).attr('href');
			callback(url);
		})
		.catch(function (err) {
			callback(null);
		});
}

function getProducts(week, callback) {
	getWeekUrl(week, url => {
		if (!url)
			return callback(null);

		request(SUPREME_COMMUNITY_BASE_URL + url)
			.then(function (htmlString) {
				callback(parseProducts(htmlString));
			})
			.catch(function (err) {
				callback(null);
			});
	});
}

function parseProducts(htmlString) {
	const $ = cheerio.load(htmlString);
	var products = [];
	$('.masonry__item').each(function (index, element) {
		const newProduct = {
			id: $(this).find('.card-details').attr('data-itemid'),
			name: $(this).find('.name.item-details').text(),
			category:$(this).attr('data-masonry-filter'),
			imageUrl: SUPREME_COMMUNITY_BASE_URL + $(this).find('img').attr('src'),
			price: $(this).find('.label-price').text().trim().split('/')[0],
			votePositive: parseInt($(this).find('.progress-bar-success').text()),
			voteNegative: parseInt($(this).find('.progress-bar-danger').text())
		}
		products.push(newProduct);
	});
	return products;
}

function getCurrentProducts(callback) {

	request(SUPREME_PRODUCTS_URL, function (err, response, body) {
		const productCategories = JSON.parse(body).products_and_categories;
		var allProducts = [];
		for (var category in productCategories) {
			if (category == "new")
				continue;
			var productList = productCategories[category].map(product => {
				return {
					name: product.name,
					id: -1,
					category: category,
					price: "$ "+product.price/100,
					votePositive: 0,
					voteNegative: 0,
					imageUrl: product.image_url_hi,
				}
			});
			allProducts = allProducts.concat(productList);
		}
		callback(allProducts);
	});
};

username = jsonfile.readFileSync(PREFS_FILE).password;
