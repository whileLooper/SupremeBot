var supremeMobile = require('./supreme-api/suprememobileapi');
var async = require('async');
var jsonfile = require('jsonfile');
var captchaSolver = require('./captchasolver');
var buyOnMobile = require('./buyOnMobile');
var moment = require('moment-timezone')
const START_TIME = { day: 4, hour: 10, minute: 57 };
const WORKER_COUNT = 2;
const TIMEOUT_MS = 1000 * 60 * 15; // Beachte dass die zeit schon vor dem drop laeuft
const CHECKOUT_URL = "https://www.supremenewyork.com/mobile#checkout";
const DATA_SITEKEY = "6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz";
var workers = [];
const IS_TESTING = process.argv.length > 2 ? process.argv[2] === 'testing' : false;
const IS_TESTING_RESTOCK = process.argv.length > 2 ? process.argv[2] === 'testingRestock' : false;

function intializeWorkers(prefs, captchaPool) {
	workers = [];
	for (var i = 0; i < WORKER_COUNT; i++)
		workers.push(new SupremeWorker(prefs, captchaPool));
}

function assignToWorker(startTime, productDefinition, callback) {
	if (workers.every(worker => worker.stopped)) {
		console.log("All workers are stopped --> product is timed out: ", productDefinition.keywords, new Date().toUTCString());
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
		console.log("product waits for assignment ", itemDefinition.keywords);
		assignToWorker(Date.now(), itemDefinition, callback);
	}, (err) => {
		workers.map(worker => !worker.stopped && worker.stop());
		workers = [];
		captchaPool.stop();
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
		this.inProgress++;
		this.solver.solveCaptcha(CHECKOUT_URL, DATA_SITEKEY, captchaToken => {
			this.captchaList.push({ token: captchaToken, timestamp: Date.now() });
			this.inProgress--;
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
		this.buyApi = new buyOnMobile.BuyOnMobile();
		this.startTimestampMS = Date.now();
		console.log("Worker has started", new Date().toUTCString());
	}

	hasWork() {
		return this.productDefinition != null;
	}

	assignProduct(productDefinition, callback) {
		console.log("Worker has product assigned:", productDefinition.keywords, new Date().toUTCString());
		this.callback = callback;
		this.productDefinition = productDefinition;
		this.checkForProduct();
	}

	checkForProduct() {
		this.checkForTimeout();
		if (this.stopped === true)
			return;

		supremeMobile.findItem(this.productDefinition.category, this.productDefinition.keywords, product => {
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

	printProduct (product) {
		console.log("Product: ", product.name);
		if (!product.styles)
			return console.log("product has no style property");

		const styles = product.styles.map ( style => {
			if (style.sizes) {
				const sizes = style.sizes.map ( size => {
					return size.name + " (" + (size.stock_level?"X":"") + ")";
				});
				return "Style: "+style.name+ sizes;
			}	else {
				return "Style: "+style.name+ "Has no Sizes!";
			}
		});
		console.log(styles)
	}

	checkForTimeout() {
		if (isTimestampOlderThan(this.startTimestampMS, TIMEOUT_MS)) {
			console.log("worker timed out with product", this.productDefinition.keywords, new Date().toUTCString());
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
			() => this.checkForProduct());
	}

	finishWork(hasUsedCaptcha) {
		console.log("Worker has " + this.productDefinition.keywords + " has fully processed!", new Date().toUTCString());
		this.captcha = hasUsedCaptcha ? null : this.captcha;
		this.productDefinition = null;
		try {
			this.callback();
		} catch (e) {
			console.log("Callback for product was already called");
		}
	}

	stop() {
		console.log("Worker has stopped!")
		this.buyApi.stop();
		this.stopped = true;
		try {
			this.callback();
		} catch (e) {
			console.log("Callback for product was already called");
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
			.filter(size => size.prios != -1)
			.filter(size => size.stock_level === 1)
			.sort((a, b) => a - b)
			.map (size => size.id+"");
			return {
				id: style.id+"",
				sizes: sizes
			}
		})
		.filter(style => style.sizes.length > 0);
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
		supremeMobile.findItem(productDefinition.category, productDefinition.keywords, product => {
			if (!product) {
				IS_TESTING_RESTOCK && console.log("Product not found: ", productDefinition.keywords);
				return callback();
			}

			console.log("Restock: ", productDefinition.keywords);
			const availableStyles = getAvailableStyles(product, productDefinition);
			IS_TESTING_RESTOCK && console.log(productDefinition.keywords, availableStyles);
			if (availableStyles.length > 0) {
				solver.solveCaptcha(CHECKOUT_URL, DATA_SITEKEY, captchaToken => {
					new buyOnMobile.BuyOnMobile().buyProduct(product,
						availableStyles,
						prefs,
						captchaToken,
						IS_TESTING_RESTOCK,
						(hasUsedCaptcha) => callback(),
						() => callback());
				}, IS_TESTING_RESTOCK);
			} else {
				callback()
			}
		});
	}, (err) => mainCallback());
}

function waitForDrop() {
	const date = moment().tz("Europe/London");
	// checkForRestock(() => { });
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

if (IS_TESTING)
	startDrop(() => process.exit());
else if (IS_TESTING_RESTOCK)
	checkForRestock(() => process.exit());
else
	waitForDrop();