const puppeteer = require('puppeteer');

class BuyProductPuppeteer {

    async buyProduct(product, styles, prefs, captchaToken, isTesting, finishCallback, retryCallback) {
        var args = { args: ['--no-sandbox'] };
        isTesting ? args.headless = false : args.headless = true;
        var browser = await puppeteer.launch(args);
        try {
            const style = styles[0];
            const sizeId = style.sizes[0];

            const page = await browser.newPage();
            await page.goto(style.id);

            const SIZE_SELECTOR = "#size";
            await page.$eval(SIZE_SELECTOR, (el, value) => el.value = value, sizeId.toString());

            const ADD_PRODUCT_SELECTOR = '#add-remove-buttons>input';
            const addProductButton = await page.$(ADD_PRODUCT_SELECTOR);
            if (!addProductButton) {
                await browser.close();
                return finishCallback();
            }

            await page.click(ADD_PRODUCT_SELECTOR);

            await page.waitFor(500);

            const CHECKOUT_SELECTOR = '#cart .checkout';
            await page.click(CHECKOUT_SELECTOR);

            await page.waitFor(500);

            const NAME_SELECTOR = '.order_billing_name';
            const EMAIL_SELECTOR = '.order_email';
            const TEL_SELECTOR = '.order_tel';
            const ADRESS_SELECTOR = '.bo';
            const CITY_SELECTOR = '.order_billing_city';
            const ZIP_SELECTOR = '.order_billing_zip';
            const COUNTRY_SELECTOR = '.order_billing_country';
            const CARD_TYPE_SELECTOR = '.credit_card_type';
            const CARD_NUMBER_SELECTOR = '.credit_card_number';
            const CARD_DATE = '.credit_card_month';
            const CARD_MONTH_SELECTOR = '#credit_card_month';
            const CARD_YEAR_SELECTOR = '#credit_card_year';
            const CARD_VVAL_SELECTOR = '#cart-vval';
            const RECAPTCHA_RESPONSE_SELECTOR = '#g-recaptcha-response';

            const TERMS_SELECTOR = '#order_terms'

            //use type because supreme checks for automation
            await type(page, NAME_SELECTOR, prefs.name);
            await type(page, EMAIL_SELECTOR, prefs.email);
            await type(page, TEL_SELECTOR, prefs.tel);
            await type(page, CITY_SELECTOR, prefs.city);
            await type(page, ZIP_SELECTOR, prefs.zip);
            await select(page, COUNTRY_SELECTOR, prefs.country);
            await select(page, CARD_TYPE_SELECTOR, prefs.cardType);
            await select(page, CARD_DATE, prefs.cardMonth, CARD_MONTH_SELECTOR);
            await select(page, CARD_DATE, prefs.cardYear, CARD_YEAR_SELECTOR);
            await type(page, CARD_VVAL_SELECTOR, prefs.cardVval);
            await page.click(TERMS_SELECTOR);

            //use evaluate instaed of eval$ because eval$ is not really working (i think because of the pseudo elements)
            await page.evaluate((selector, value) => document.querySelector(selector).value = value, RECAPTCHA_RESPONSE_SELECTOR, captchaToken);

            if (!isTesting) {
                await type(page, CARD_NUMBER_SELECTOR, prefs.cardNumber);
                await type(page, ADRESS_SELECTOR, prefs.adress);
            }

            await page.waitFor(500);

            await page.evaluate('checkoutAfterCaptcha();');

            page.on('response', response => {
                const reqUrl = response.request().url();
                if (reqUrl === 'https://www.supremenewyork.com/checkout.json') {
                    response.text().then(async function (body) {
                        console.log(body);
                        await page.waitFor(250);
                        await page.screenshot({ path: 'results.png', fullPage: true });
                        await browser.close();
                        finishCallback(true);
                    }).catch(err => {
                        browser.close();
                    });
                }
            });

        } catch (e) {
            console.log(e);
            try {
                browser.close();
            } catch (expection) {
            }
            retryCallback();
        }
    }

    stop() {
        try {
            browser.close();
        } catch (expection) {
        }
    }
}

function type(page, parentSelector, value) {
    var typePromise = new Promise(async function (resolve, reject) {
        try {
            var parentElement = null;
            while (!parentElement) {
                parentElement = await page.$(parentSelector);
            }
            const inputField = await parentElement.$('input');
            await inputField.click();
            await page.keyboard.type(value);
            resolve();
        } catch (e) {
            console.log(parentSelector);
            reject(e);
        }
    });
    return promiseTimeout(5000, typePromise);
}

function select(page, parentSelector, value, childSelector) {

    var selectPromise = new Promise(async function (resolve, reject) {
        try {
            if (!childSelector) {
                childSelector = parentSelector + ' select';
            }
            var optionSelector = childSelector + ' option[value="' + value + '"]';

            var parentElement = null;
            while (!parentElement) {
                parentElement = await page.$(parentSelector);
            }
            var childElement = await parentElement.$(childSelector);
            await childElement.click();

            var startValue = await page.evaluate((selector) => document.querySelector(selector).value, childSelector);
            var startSelector = childSelector + ' option[value="' + startValue + '"]';
            var startIndex = await page.evaluate((selector) => document.querySelector(selector).index, startSelector);
            var index = await page.evaluate((selector) => document.querySelector(selector).index, optionSelector);
            for (var i = startIndex; i != index; (startIndex < index) ? i++ : i--) {
                (startIndex < index) ? await page.keyboard.down('ArrowDown') : await page.keyboard.down('ArrowUp');
            }
            await page.keyboard.down('Enter');
            resolve();
        } catch (e) {
            reject(e);
        }
    });
    return promiseTimeout(5000, selectPromise);
}

const promiseTimeout = function (ms, promise) {
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('Timed out in ' + ms + 'ms.')
        }, ms)
    });

    return Promise.race([
        promise,
        timeout
    ]);
}

exports.BuyProductPuppeteer = BuyProductPuppeteer;