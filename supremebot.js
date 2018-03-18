const supreme = require('./supreme-api/supremeapi');
const puppeteer = require('puppeteer');
var async = require('async');
const fs = require('fs');
var jsonfile = require('jsonfile');
var captchaSolver = require('./captchasolver');
const WORKER_COUNT = 1;
var workers = [];

function intializeWorkers(prefs, solver) {
	workers = [];
	for (var i = 0; i < WORKER_COUNT; i++)
		workers.push(new SupremeWorker(prefs, solver));
}

function assignToWorker(productDefinition, callback) {
	isAssigned = workers.some(worker => {
		if (!worker.hasWork()) {
			worker.assignProduct(productDefinition, callback);
			return true;
		} else {
			return false;
		}
	});
	if (!isAssigned) {
		setTimeout(() => assignToWorker(productDefinition, callback), 1000);
	}
}

function startDrop(mainCallback) {
	var prefs = jsonfile.readFileSync("./prefs.json");
	var droplist = jsonfile.readFileSync("./droplist.json");
	var solver = new captchaSolver.CaptchaSolver(prefs.antiCaptchaKey);
	intializeWorkers(prefs, solver);

	async.each(droplist, (itemDefinition, callback) => {
		assignToWorker(itemDefinition, callback);
	}, (err) => {
		workers.map(worker => worker.stop());
		mainCallback();
	});
}

class SupremeWorker {

	constructor(prefs, solver) {
		this.prefs = prefs;
		this.solver = solver;
		this.getCaptchaToken();
	}

	hasWork() {
		return this.productDefinition != null;
	}

	assignProduct(productDefinition, callback) {
		this.callback = callback;
		this.productDefinition = productDefinition;
		this.checkForProduct();
	}

	getCaptchaToken() {
		if (this.stopped == true)
			return;

		const startTimestampMs = Date.now();
		this.solver.solveCaptcha('https://www.supremenewyork.com/checkout', '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz', (captchaToken) => {
			console.log("New captcha token: "+ captchaToken);
			this.captchaToken = captchaToken;
			const endTimestampMS = Date.now();
			const difference = endTimestampMS - startTimestampMs;
			var nextTokenInMS = 100 * 1000 - difference;
			nextTokenInMS = nextTokenInMS > 0 ? nextTokenInMS : 0;
			setTimeout(() => this.getCaptchaToken(), nextTokenInMS);
		}, true);
	}

	checkForProduct() {
		if (this.stopped == true)
			return;

		supreme.seek(this.productDefinition.category, this.productDefinition.keywords, this.productDefinition.style, (product, err) => {
			if (product && this.captchaToken) {
				const sizeId = product.availability != "Sold Out" ? this.chooseSize(product) : null;
				if (sizeId)
					this.buyProduct(product, sizeId);
				else
					this.finishWork();
			} else {
				setTimeout(() => this.checkForProduct(), 1000);
			}
		});
	}

	chooseSize(product) {
		const sizeName = this.productDefinition.sizes.find(size => {
			return product.sizesAvailable.find(sizeObject => {
				return sizeObject.size == size;
			});
		});
		return sizeName ? product.sizesAvailable.find(sizeObject => sizeObject.size == sizeName).id : null;
	}

	async buyProduct(product, sizeId) {
		try {
			this.browser = await puppeteer.launch({ headless: false });

			const page = await this.browser.newPage();
			await page.goto(product.link);

			const SIZE_SELECTOR = "#size";
			await page.select(SIZE_SELECTOR, sizeId.toString());

			const ADD_PRODUCT_SELECTOR = '#add-remove-buttons>input';
			const addProductButton = await page.$(ADD_PRODUCT_SELECTOR);
			if (!addProductButton)
				return this.finishWork();

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

			// await page.$eval(NAME_SELECTOR, (el, value) => el.value = value, this.prefs.name);
			// await page.$eval(EMAIL_SELECTOR, (el, value) => el.value = value, this.prefs.email);
			// await page.$eval(TEL_SELECTOR, (el, value) => el.value = value, this.prefs.tel);
			// await page.$eval(ADRESS_SELECTOR, (el, value) => el.value = value, this.prefs.adress);
			// await page.$eval(CITY_SELECTOR, (el, value) => el.value = value, this.prefs.city);
			// await page.$eval(ZIP_SELECTOR, (el, value) => el.value = value, this.prefs.zip);
			// await page.$eval(COUNTRY_SELECTOR, (el, value) => el.value = value, this.prefs.country);
			// await page.$eval(CARD_TYPE_SELECTOR, (el, value) => el.value = value, this.prefs.cardType);
			// await page.$eval(CARD_NUMBER_SELECTOR, (el, value) => el.value = value, this.prefs.cardNumber);
			// await page.$eval(CARD_MONTH_SELECTOR, (el, value) => el.value = value, this.prefs.cardMonth);
			// await page.$eval(CARD_YEAR_SELECTOR, (el, value) => el.value = value, this.prefs.cardYear);
			// await page.$eval(CARD_VVAL_SELECTOR, (el, value) => el.value = value, this.prefs.cardVval);

			await page.evaluate('checkoutAfterCaptcha();');

			// await page.click(TERMS_SELECTOR);

			await page.waitFor(3 * 1000);

			this.finishWork();
		} catch (e) {
			this.browser.close();
			this.checkForProduct();
			console.log(e);
		}
	}

	finishWork() {
		this.browser ? this.browser.close() : null;
		this.productDefinition = null;
		this.callback();
	}

	stop() {
		this.stopped = true;
	}
}

startDrop(() => {
	console.log("finished!");
})