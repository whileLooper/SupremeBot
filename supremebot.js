var supremeMobile = require('./supreme-api/suprememobileapi');
var async = require('async');
var jsonfile = require('jsonfile');
var captchaSolver = require('./captchasolver');
var buyOnMobile = require('./buyOnMobile');
const WORKER_COUNT = 2;
const WORKER_TIMEOUT_MS = 1000 * 60 * 10;
var workers = [];
var isTesting = process.argv.length > 2 ? process.argv[2] === 'testing' : false;

function intializeWorkers(prefs, captchaPool) {
	workers = [];
	for (var i = 0; i < WORKER_COUNT; i++)
		workers.push(new SupremeWorker(prefs, captchaPool));
}

function assignToWorker(productDefinition, callback) {
	if (workers.length == 0)
		return callback();

	var isAssigned = workers.some(worker => {
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
	var captchaPool = new CaptchaPool(solver);
	intializeWorkers(prefs, captchaPool);

	async.each(droplist, (itemDefinition, callback) => {
		assignToWorker(itemDefinition, callback);
	}, (err) => {
		workers.map(worker => worker.stop());
		workers = [];
		captchaPool.stop ();
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
		this.solver.solveCaptcha('https://www.supremenewyork.com/checkout', '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz', captchaToken => {
			this.captchaList.push({ token: captchaToken, timestamp: Date.now() });
			this.inProgress--;
		}, isTesting);
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
		console.log("Worker has stared");
	}

	hasWork() {
		return this.productDefinition != null;
	}

	assignProduct(productDefinition, callback) {
		console.log("Worker has product assigned:",productDefinition.name);
		this.callback = callback;
		this.productDefinition = productDefinition;
		this.checkForProduct();
	}

	checkForTimeout() {
		const differenceMS = Date.now() - this.startTimestampMS;
		if (differenceMS > WORKER_TIMEOUT_MS)
			this.stop();
	}

	checkForProduct() {
		this.checkForTimeout();
		if (this.stopped === true)
			return;

		supremeMobile.findItem(this.productDefinition.category, this.productDefinition.keywords, product => {
			const startTime = new Date();
			if (product && this.getCaptcha()) {
				const availableStyles = this.getAvailableStyles(product);
				console.log("Available Styles: ",availableStyles);
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
			isTesting,
			(hasUsedCaptcha) => this.finishWork(hasUsedCaptcha),
			() => this.checkForProduct());
	}

	finishWork(hasUsedCaptcha) {
		this.captcha = hasUsedCaptcha ? null : this.captcha;
		this.productDefinition = null;
		this.callback();
	}

	getAvailableStyles(product) {
		this.productDefinition.styles = this.productDefinition.styles.map(style => style.toLowerCase());
		this.productDefinition.sizes = this.productDefinition.sizes.map(style => style.toLowerCase());
		return this.productDefinition.styles.map(styleDefinition => styleDefinition.toLowerCase())
			.map(styleDefinition => {
				var foundStyle = product.styles.find(style => styleDefinition === formatStyle(style.name));
				const sizes = this.productDefinition.sizes.map ( sizeDefiniton => {
					return foundStyle.sizes.find ( size => formatStyle(size.name) === sizeDefiniton);
				}).filter(size => size != null)
				.filter (size => size.stock_level === 1)
				.map (size => size.id+"");

				return {
					id: foundStyle ? foundStyle.id+"" : "",
					sizes: sizes
				}
			}).filter(style => style.sizes.length > 0)
			.filter(style => style.id);
	}

	stop() {
		console.log("Worker has stopped!")
		this.buyApi.stop();
		this.stopped = true;
	}
}

function waitForDrop() {
	const date = new Date();
	if (date.getDay() === 4 &&
		date.getUTCHours() === 10 &&
		date.getMinutes() > 57) {
		console.log("Drop will be soon! Bot starts to prepare!")
		startDrop(() => waitForDrop());
	} else {
		setTimeout(() => waitForDrop(), 10000);
	}
}

function formatStyle(string) {
	string = encodeURI(string);
	string = string.replace(/%EF%BB%BF/g, "");
	return decodeURI(string).toLowerCase();
}

function isTimestampOlderThan(timestamp, treshold) {
	return Date.now() - timestamp > treshold;
}

if (isTesting)
	startDrop(() => process.exit());
else
	waitForDrop();