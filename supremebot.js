var supreme = require('./supreme-api/supremeapi');
var async = require('async');
var fs = require('fs');
var jsonfile = require('jsonfile');
var captchaSolver = require('./captchasolver');
var buyProductPuppeteer = require('./buyProductPuppeteer');
const WORKER_COUNT = 1;
const WORKER_TIMEOUT_MS = 1000* 60 * 12;
var workers = [];
var isHeadless = process.argv [2] != "testing"

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
		workers = [];
		mainCallback();
	});
}

class SupremeWorker {

	constructor(prefs, solver) {
		this.prefs = prefs;
		this.solver = solver;
		this.buyApi = new buyProductPuppeteer.BuyProductPuppeteer();
		this.startTimestampMS = Date().now;
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

	checkForTimeout () {
		const differenceMS = Date.now() - this.startTimestampMS
		if (differenceMS > WORKER_TIMEOUT_MS)
			this.stop ();
	}

	getCaptchaToken() {
		this.checkForTimeout ();
		if (this.stopped == true)
			return;

		const startTimestampMs = Date.now();
		this.solver.solveCaptcha('https://www.supremenewyork.com/checkout', '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz', (captchaToken) => {
			console.log("New captcha token: " + captchaToken);
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

	buyProduct(product, sizeId) {
		this.buyApi.buyProduct(product, sizeId, this.prefs, isHeadless, () => this.finishWork(), () => this.checkForProduct());
	}

	finishWork() {
		this.productDefinition = null;
		this.callback();
	}

	stop() {
		this.buyApi.stop ();
		this.stopped = true;
	}
}

// startDrop(() => {
// 	console.log("finished!");
// });

function waitForDrop () {
	const date = new Date();
	if (date.getDay() == 4 && 
		date.getUTCHours() == 10 &&
		date.getMinutes() > 57) {
		console.log("Drop will be soon! Bot starts to prepare!")
		startDrop (() => waitForDrop());
	} else {
		setTimeout(() => waitForDrop (), 10000);
	}
}

waitForDrop ();