const puppeteer = require('puppeteer');

class BuyProductPuppeteer {

    async buyProduct(product, styles, prefs, captchaToken, isTesting, finishCallback, retryCallback) {
        var args = { args: ['--no-sandbox'] };
        isTesting ? args.headless = false : args.headless = true;
        var browser = await puppeteer.launch(args);
        try {
            const style = styles [0];
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

            await page.waitFor(1000);

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
            const RECAPTCHA_RESPONSE_SELECTOR = '#g-recaptcha-response';

            await page.$eval(NAME_SELECTOR, (el, value) => el.value = value, prefs.name);
            await page.$eval(EMAIL_SELECTOR, (el, value) => el.value = value, prefs.email);
            await page.$eval(TEL_SELECTOR, (el, value) => el.value = value, prefs.tel);
            await page.$eval(CITY_SELECTOR, (el, value) => el.value = value, prefs.city);
            await page.$eval(ZIP_SELECTOR, (el, value) => el.value = value, prefs.zip);
            await page.$eval(COUNTRY_SELECTOR, (el, value) => el.value = value, prefs.country);
            await page.$eval(CARD_TYPE_SELECTOR, (el, value) => el.value = value, prefs.cardType);
            await page.$eval(CARD_MONTH_SELECTOR, (el, value) => el.value = value, prefs.cardMonth);
            await page.$eval(CARD_YEAR_SELECTOR, (el, value) => el.value = value, prefs.cardYear);
            await page.$eval(CARD_VVAL_SELECTOR, (el, value) => el.value = value, prefs.cardVval);
            await page.click(TERMS_SELECTOR);
            await page.$eval(RECAPTCHA_RESPONSE_SELECTOR, (el, value) => el.value = value, captchaToken);

            if (!isTesting) {
                await page.$eval(CARD_NUMBER_SELECTOR, (el, value) => el.value = value, prefs.cardNumber);
                await page.$eval(ADRESS_SELECTOR, (el, value) => el.value = value, prefs.adress);
            }

            await page.waitFor(3000);

            await page.evaluate('checkoutAfterCaptcha();');

            page.on('response', response => {
                const reqUrl = response.request().url();
                if (reqUrl === 'https://www.supremenewyork.com/checkout.json') {
                    response.text().then(body => {
                        console.log(body);
                        browser.close();
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

exports.BuyProductPuppeteer = BuyProductPuppeteer;