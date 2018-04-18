var async = require('async');
var jsonfile = require('jsonfile');
var moment = require('moment-timezone')

var supremeApi = require('./apis/supremeapi');
var supremeMobile = require('./apis/suprememobileapi');
var captchaSolver = require('./apis/captchasolver');
var buyOnMobile = require('./apis/buyOnMobile');
var buyRequest = require('./apis/buyRequest');
var buyProductPuppeteer = require('./apis/buyProductPuppeteer');

const START_TIME = { day: 4, hour: 10, minute: 57 };
const WORKER_COUNT = 1;
const TIMEOUT_MS = 1000 * 60 * 5; // Beachte dass die zeit schon vor dem drop laeuft
const CHECKOUT_URL = "https://www.supremenewyork.com/checkout"; // for captcha solver
const DATA_SITEKEY = "6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz"; // for captcha solver
var workers = [];
const IS_TESTING = process.argv.length > 2 ? process.argv[2] === 'testing' : false;
const IS_TESTING_RESTOCK = process.argv.length > 2 ? process.argv[2] === 'testingRestock' : false;
const IS_RESTOCK = process.argv.length > 2 ? process.argv[2] === 'restock' : false;
const IS_PUPPETEER = process.argv.includes('puppeteer');

function intializeWorkers(prefs, captchaPool) {
	workers = [];
	for (var i = 0; i < WORKER_COUNT; i++)
		workers.push(new SupremeWorker(prefs, captchaPool));
}

function assignToWorker(startTime, productDefinition, callback) {
	if (workers.every(worker => worker.stopped)) {
		console.log("All workers are stopped --> product is timed out: ", productDefinition.name, new Date().toUTCString());
		return callback();
	}

	var isAssigned = workers.some(worker => {
		if (!worker.hasWork()) {
			worker.assignProduct(productDefinition, callback);
			return true;
		} else {
			return false;
		}
	});
	if (!isAssigned) {
		setTimeout(() => assignToWorker(startTime, productDefinition, callback), 1000);
	}
}

function startDrop(mainCallback) {
	var prefs = jsonfile.readFileSync("./prefs.json");
	var droplist = jsonfile.readFileSync("./droplist.json");
	var solver = new captchaSolver.CaptchaSolver(prefs.antiCaptchaKey);
	var captchaPool = new CaptchaPool(solver);
	intializeWorkers(prefs, captchaPool);

	async.each(droplist, (itemDefinition, callback) => {
		console.log("product waits for assignment ", itemDefinition.name);
		assignToWorker(Date.now(), itemDefinition, callback);
	}, (err) => {
		workers.forEach(worker => !worker.stopped && worker.stop());
		workers = [];
		captchaPool.stop();
		console.log("drop is fully processed!");
		mainCallback();
	});
}

class CaptchaPool {

	constructor(solver) {
		this.inProgress = 0;
		this.solver = solver;
		this.captchaList = [];
		this.updateCaptchaPool();
	}

	updateCaptchaPool() {
		if (this.stopped)
			return;

		this.captchaList = this.captchaList.filter(captcha => !isTimestampOlderThan(captcha.timestamp, 1000 * 100));
		const onlyNewCaptchas = this.captchaList.filter(captcha => !isTimestampOlderThan(captcha.timestamp, 1000 * 60));
		if (onlyNewCaptchas.length + this.inProgress < WORKER_COUNT * 2) {
			this.requestNewCaptcha();
		}
		setTimeout(() => this.updateCaptchaPool(), 1000 * 5);
	}

	requestNewCaptcha() {
		if (this.stopped)
			return;

		this.inProgress++;
		this.solver.solveCaptcha(CHECKOUT_URL, DATA_SITEKEY, captchaToken => {
			this.inProgress--;
			if (captchaToken) {
				this.captchaList.push({ token: captchaToken, timestamp: Date.now() });
			} else {
				console.log("receive no token! Will request new token");
				this.requestNewCaptcha();
			}
		}, IS_TESTING);
	}

	getCaptcha() {
		return this.captchaList.length > 0 ? this.captchaList.shift() : null;
	}

	stop() {
		this.stopped = true;
	}
}

class SupremeWorker {

	constructor(prefs, captchaPool) {
		this.prefs = prefs;
		this.captchaPool = captchaPool;
		this.buyApi = IS_PUPPETEER ? new buyProductPuppeteer.BuyProductPuppeteer() : new buyRequest.BuyRequest();
		this.startTimestampMS = Date.now();
		console.log("Worker has started", new Date().toUTCString());
	}

	hasWork() {
		return this.productDefinition != null;
	}

	assignProduct(productDefinition, callback) {
		console.log("Worker has product assigned:", productDefinition.name, new Date().toUTCString());
		this.callback = callback;
		this.productDefinition = productDefinition;
		this.checkForProduct();
	}

	checkForProduct() {
		this.checkForTimeout();
		if (this.stopped === true)
			return;

		usedApi().findItem(this.productDefinition.category, this.productDefinition.name, product => {
			const startTime = new Date().toUTCString();
			if (product && this.getCaptcha()) {
				const availableStyles = getAvailableStyles(product, this.productDefinition);
				this.printProduct(product);

				console.log("Available Styles: ", availableStyles);
				if (availableStyles.length > 0) {
					console.log("Start Time: " + startTime);
					this.buyProduct(product, availableStyles);
				} else
					this.finishWork(false);
			} else {
				setTimeout(() => this.checkForProduct(), 500);
			}
		});
	}

	printProduct(product) {
		console.log("Product: ", product.name);
		if (!product.styles)
			return console.log("product has no style property");

		const styles = product.styles.map(style => {
			if (style.sizes) {
				const sizes = style.sizes.map(size => {
					return size.name + " (" + (size.stock_level ? "X" : "") + ")";
				});
				return "Style: " + style.name + sizes;
			} else {
				return "Style: " + style.name + "Has no Sizes!";
			}
		});
		console.log(styles)
	}

	checkForTimeout() {
		if (isTimestampOlderThan(this.startTimestampMS, TIMEOUT_MS)) {
			console.log("worker timed out with product", this.productDefinition.name, new Date().toUTCString());
			this.stop();
		}
	}

	getCaptcha() {
		if (this.captcha && !isTimestampOlderThan(this.captcha.timestamp, 1000 * 105)) {
			return this.captcha;
		} else {
			this.captcha = this.captchaPool.getCaptcha();
			return this.captcha;
		}
	}

	buyProduct(product, availableStyles) {
		this.buyApi.buyProduct(product,
			availableStyles,
			this.prefs,
			this.captcha.token,
			IS_TESTING,
			(hasUsedCaptcha) => this.finishWork(hasUsedCaptcha),
			(hasUsedCaptcha = false) => {
				this.captchaToken = null;
				this.checkForProduct();
			});
	}

	finishWork(hasUsedCaptcha) {
		console.log("Worker has " + this.productDefinition.name + " has fully processed!", new Date().toUTCString());
		this.captcha = hasUsedCaptcha ? null : this.captcha;
		if (this.productDefinition) {
			this.productDefinition = null;
			this.callback();
		}
	}

	stop() {
		console.log("Worker has stopped!")
		this.buyApi.stop();
		this.stopped = true;
		if (this.productDefinition) {
			this.productDefinition = null;
			this.callback();
		}
	}
}

function getAvailableStyles(product, productDefinition) {
	return product.styles
		.map(style => {
			style.prio = productDefinition.styles ? productDefinition.styles.findIndex(styleDefinition => stringsEqual(styleDefinition, style.name)) : 0;
			return style;
		})
		.filter(style => style.prio != -1)
		.sort((a, b) => a - b)
		.map(style => {
			const sizes = style.sizes.map(size => {
				size.prio = productDefinition.sizes ? productDefinition.sizes.findIndex(sizeDefiniton => stringsEqual(sizeDefiniton, size.name)) : 0;
				return size;
			})
				.filter(size => size.prio != -1)
				.filter(size => size.stock_level === 1)
				.sort((a, b) => a - b)
				.map(size => size.id + "");
			return {
				id: style.id + "",
				sizes: sizes
			}
		})
		.filter(style => style.sizes.length > 0);
}

function usedApi() {
	return IS_PUPPETEER ? supremeApi : supremeMobile;
}

function stringsEqual(string1, string2) {
	return unifyString(string1) == unifyString(string2);
}

function unifyString(string) {
	string = encodeURI(string);
	string = string.replace(/%EF%BB%BF/g, "");
	return decodeURI(string).toLowerCase();
}

function checkForRestock(mainCallback) {
	var prefs = jsonfile.readFileSync("./prefs.json");
	var droplist = jsonfile.readFileSync("./droplist.json");
	var solver = new captchaSolver.CaptchaSolver(prefs.antiCaptchaKey);

	async.eachSeries(droplist, (productDefinition, callback) => {
		usedApi().findItem(productDefinition.category, productDefinition.name, product => {
			if (!product) {
				IS_TESTING_RESTOCK && console.log("Product not found: ", productDefinition.name);
				return callback();
			}

			const availableStyles = getAvailableStyles(product, productDefinition);
			IS_TESTING_RESTOCK && console.log(productDefinition.name, availableStyles);
			if (availableStyles.length > 0) {
				console.log("Restock: ", productDefinition.name);
				solver.solveCaptcha(CHECKOUT_URL, DATA_SITEKEY, captchaToken => {
					var buyApi = IS_PUPPETEER ? new buyProductPuppeteer.BuyProductPuppeteer() : new buyRequest.BuyRequest();
					buyApi.buyProduct(product,
						availableStyles,
						prefs,
						captchaToken,
						IS_TESTING_RESTOCK,
						(hasUsedCaptcha) => callback(),
						(hasUsedCaptcha = false) => callback());
				}, IS_TESTING_RESTOCK);
			} else {
				callback()
			}
		});
	}, (err) => mainCallback());
}

function waitForDrop() {
	const date = moment().tz("Europe/London");
	if (date.day() === START_TIME.day &&
		date.hour() === START_TIME.hour &&
		date.minute() > START_TIME.minute) {
		console.log("Drop will be soon! Bot starts to prepare!")
		startDrop(() => waitForDrop());
	} else {
		setTimeout(() => waitForDrop(), 10000);
	}
}

function isTimestampOlderThan(timestamp, treshold) {
	return Date.now() - timestamp > treshold;
}

function watchRestock() {
	checkForRestock(() => {
		setTimeout(() => watchRestock(), 10000);
	});
}

if (IS_TESTING)
	startDrop(() => process.exit());
else if (IS_TESTING_RESTOCK)
	checkForRestock(() => process.exit());
else if (IS_RESTOCK)
	watchRestock();
else
	waitForDrop();