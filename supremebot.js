var supremeMobile = require('./supreme-api/suprememobileapi');
var async = require('async');
var jsonfile = require('jsonfile');
var captchaSolver = require('./captchasolver');
var buyOnMobile = require('./buyOnMobile');
const WORKER_COUNT = 1;
const WORKER_TIMEOUT_MS = 1000 * 60 * 2;
var workers = [];
var isTesting = process.argv.length > 2 ? process.argv [2] === 'testing' : false;

function intializeWorkers(prefs, captchaPool) {
	workers = [];
	for (var i = 0; i < WORKER_COUNT; i++)
		workers.push(new SupremeWorker(prefs, captchaPool));
}

function assignToWorker(productDefinition, callback) {
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
		this.captchaList = this.captchaList.filter(captcha => !isTimestampOlderThan(captcha.timestamp, 1000 * 60 * 2));
		const onlyNewCaptchas = this.captchaList.filter(captcha => !isTimestampOlderThan(captcha.timestamp, 1000 * 60));
		if (onlyNewCaptchas.length + this.inProgress < WORKER_COUNT * 2) {
			this.requestNewCaptcha();
		}
		setTimeout(() => this.updateCaptchaPool(), 1000 * 5);
	}

	requestNewCaptcha() {
		this.inProgress++;
		this.solver.solveCaptcha('https://www.supremenewyork.com/checkout', '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz', captchaToken => {
			console.log("New captcha token: " + captchaToken);
			this.captchaList.push({token:captchaToken, timestamp:Date.now()});
			this.inProgress--;
		}, true);
	}

	getCaptcha() {
		return this.captchaList.length > 0 ? this.captchaList.shift() : null;
	}

	stop () {
		this.stopped = true;
	}
}

class SupremeWorker {

	constructor(prefs, captchaPool) {
		this.prefs = prefs;
		this.captchaPool = captchaPool;
		this.buyApi = new buyOnMobile.BuyOnMobile();
		this.startTimestampMS = Date.now();
	}

	hasWork() {
		return this.productDefinition != null;
	}

	assignProduct(productDefinition, callback) {
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
			if (product && this.getCaptcha ()) {
				const availableStyles = this.getAvailableStyles(product);
				if (availableStyles.length > 0)
					this.buyProduct(product, availableStyles);
				else
					this.finishWork();
			} else {
				setTimeout(() => this.checkForProduct(), 1000);
			}
		});
	}

	getCaptcha () {
		if (this.captcha && !isTimestampOlderThan(this.captcha.timestamp, 1000* 100)) {
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
			() => this.finishWork(),
			() => this.checkForProduct());
	}

	finishWork() {
		this.productDefinition = null;
		this.callback();
	}

	getAvailableStyles(product) {
		this.productDefinition.styles = this.productDefinition.styles.map(style => style.toLowerCase());
		this.productDefinition.sizes = this.productDefinition.sizes.map(style => style.toLowerCase());
		return product.styles.map(style => {
			const sizes = style.sizes.filter(size => {
				return this.productDefinition.sizes.includes(this.formatStyle(size.name))
					&& size.stock_level === 1;
			}).map(size => size.id + "");
			return {
				name: this.formatStyle(style.name),
				id: style.id + "",
				sizes: sizes
			}
		}).filter(style => style.sizes.length > 0)
			.filter(style => this.productDefinition.styles.includes(style.name));
	}

	static formatStyle(string) {
		string = encodeURI(string);
		string = string.replace(/%EF%BB%BF/g, "");
		return decodeURI(string).toLowerCase();
	}

	stop() {
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

function isTimestampOlderThan(timestamp, treshold) {
	return Date.now() - timestamp > treshold;
}

if (isTesting)
	startDrop(() => process.exit());
else
	waitForDrop();