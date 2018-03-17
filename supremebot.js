const supreme = require('./supreme-api/supremeapi');
const puppeteer = require('puppeteer');
var async = require('async');
const fs = require('fs');
var jsonfile = require('jsonfile');
const WORKER_COUNT = 3;
var workers = [];

function intializeWorkers(prefs) {
	workers = [];
	for (var i = 0; i < WORKER_COUNT; i++)
		workers.push(new SupremeWorker(prefs));
}

function assignToWorker (productDefinition, callback) {
	isAssigned = workers.some ( worker => {
		if (!worker.hasWork ()) {
			worker.assignProduct (productDefinition, callback);
			return true;
		} else {
			return false;
		}
	});
	if (!isAssigned) {
		setTimeout(()=>assignToWorker(productDefinition, callback), 1000);
	}
}

function startDrop(mainCallback) {
	var prefs = jsonfile.readFileSync("./prefs.json");
	var droplist = jsonfile.readFileSync("./droplist.json");
	intializeWorkers(prefs);

	async.each(droplist, (itemDefinition, callback) => {
		assignToWorker (itemDefinition, callback);
	}, (err) => {
		mainCallback();
	});
}

class SupremeWorker {

	constructor(prefs) {
		this.prefs = prefs;
	}

	hasWork () {
		return this.productDefinition != null;
	}

	assignProduct(productDefinition, callback) {
		this.callback = callback;
		this.productDefinition = productDefinition;
		this.checkForProduct ();
	}

	checkForProduct () {
		supreme.seek(this.productDefinition.category, this.productDefinition.keywords, this.productDefinition.style, (product, err) => {
			if (product) {
				this.buyProduct(product);
			} else {
				setTimeout(()=>this.checkForProduct(), 1000);
			}
		});
	}

	async buyProduct(product) {
		var browser;

		browser = await puppeteer.launch({ headless: false });

		const page = await browser.newPage();
		await page.goto(product.link);

		const ADD_PRODUCT_SELECTOR = '#add-remove-buttons>input';
		await page.click(ADD_PRODUCT_SELECTOR);

		await page.waitFor(1 * 1000);

		const CHECKOUT_SELECTOR = '#cart .checkout';
		await page.click(CHECKOUT_SELECTOR);

		await page.waitFor(1 * 1000);

		const NAME_SELECTOR = '#order_billing_name';
		const EMAIL_SELECTOR = '#order_email';
		const TEL_SELECTOR = '#order_tel';
		const ADRESS_SELECTOR = '#bo';
		const CITY_SELECTOR = '#order_billing_city';
		const ZIP_SELECTOR = '#order_billing_zip';
		const COUNTRY_SELECTOR = '#order_billing_country';
		const CARD_TYPE_SELECTOR = '#credit_card_type';
		const CARD_NUMBER_SELECTOR = '#cnb';
		const CARD_MONTH_SELECTOR = '#credit_card_month';
		const CARD_YEAR_SELECTOR = '#credit_card_year';
		const CARD_VVAL_SELECTOR = '#vval';
		const TERMS_SELECTOR = '#order_terms'

		await page.$eval(NAME_SELECTOR, (el, value) => el.value = value, this.prefs.name);
		await page.$eval(EMAIL_SELECTOR, (el, value) => el.value = value, this.prefs.email);
		await page.$eval(TEL_SELECTOR, (el, value) => el.value = value, this.prefs.tel);
		await page.$eval(ADRESS_SELECTOR, (el, value) => el.value = value, this.prefs.adress);
		await page.$eval(CITY_SELECTOR, (el, value) => el.value = value, this.prefs.city);
		await page.$eval(ZIP_SELECTOR, (el, value) => el.value = value, this.prefs.zip);
		await page.$eval(COUNTRY_SELECTOR, (el, value) => el.value = value, this.prefs.country);
		await page.$eval(CARD_TYPE_SELECTOR, (el, value) => el.value = value, this.prefs.cardType);
		await page.$eval(CARD_NUMBER_SELECTOR, (el, value) => el.value = value, this.prefs.cardNumber);
		await page.$eval(CARD_MONTH_SELECTOR, (el, value) => el.value = value, this.prefs.cardMonth);
		await page.$eval(CARD_YEAR_SELECTOR, (el, value) => el.value = value, this.prefs.cardYear);
		await page.$eval(CARD_VVAL_SELECTOR, (el, value) => el.value = value, this.prefs.cardVval);

		// await page.click(TERMS_SELECTOR);

		await page.waitFor(3 * 1000);

		browser.close();

		this.finishWork ();
	}

	finishWork () {
		this.productDefinition = null;
		this.callback ();
	}
}

startDrop(() => {
	console.log("finished!");
})