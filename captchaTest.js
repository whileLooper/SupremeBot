const puppeteer = require('puppeteer');
var captchaSolver = require('./captchasolver');
var jsonfile = require('jsonfile');

const fs = require('fs');

async function bypassCaptcha(url, captchaToken, callback) {
    var browser;

    browser = await puppeteer.launch({
        headless: false,
        args: ['--incognito']
    });

    const pages = await browser.pages();
    const page = pages[0];
    await page.goto(url);

    await page.waitFor(1 * 1000);

    const RECAPTCHA_RESPONSE_SELECTOR = '#g-recaptcha-response';
    await page.$eval(RECAPTCHA_RESPONSE_SELECTOR, (el, value) => el.value = value, captchaToken);

    await page.waitFor(1 * 1000);


    await page.evaluate('onSuccess()');

    await page.waitFor(1 * 1000);

    await page.waitFor(180 * 1000);

    browser.close();
    callback();
}

var prefs = jsonfile.readFileSync("./prefs.json");

var solver = new captchaSolver.CaptchaSolver(prefs.antiCaptchaKey);

solver.solveCaptcha('https://www.google.com/recaptcha/api2/demo?invisible=true', '6LfP0CITAAAAAHq9FOgCo7v_fb0-pmmH9VW3ziFs', (captchaToken) => {
    bypassCaptcha('https://www.google.com/recaptcha/api2/demo?invisible=true', captchaToken, () => {
        console.log("success");
    });
});


