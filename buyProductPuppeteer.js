const puppeteer = require('puppeteer');

class BuyProductPuppeteer {

    async buyProduct(product, sizeId, prefs, isTesting, finishCallback, retryCallback) {
        var args = {args: ['--no-sandbox']};
        isTesting ? args.headless = false : args.headless = true;
        var browser = await puppeteer.launch(args);
        try {

            const page = await browser.newPage();
            await page.goto(product.link);

            const SIZE_SELECTOR = "#size";
            await page.select(SIZE_SELECTOR, sizeId.toString());

            const ADD_PRODUCT_SELECTOR = '#add-remove-buttons>input';
            const addProductButton = await page.$(ADD_PRODUCT_SELECTOR);
            if (!addProductButton) {
                await browser.close();
                return finishCallback();
            }

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

            await page.$eval(NAME_SELECTOR, (el, value) => el.value = value, prefs.name);
            await page.$eval(EMAIL_SELECTOR, (el, value) => el.value = value, prefs.email);
            await page.$eval(TEL_SELECTOR, (el, value) => el.value = value, prefs.tel);
            await page.$eval(ADRESS_SELECTOR, (el, value) => el.value = value, prefs.adress);
            await page.$eval(CITY_SELECTOR, (el, value) => el.value = value, prefs.city);
            await page.$eval(ZIP_SELECTOR, (el, value) => el.value = value, prefs.zip);
            await page.$eval(COUNTRY_SELECTOR, (el, value) => el.value = value, prefs.country);
            await page.$eval(CARD_TYPE_SELECTOR, (el, value) => el.value = value, prefs.cardType);
            await page.$eval(CARD_NUMBER_SELECTOR, (el, value) => el.value = value, prefs.cardNumber);
            await page.$eval(CARD_MONTH_SELECTOR, (el, value) => el.value = value, prefs.cardMonth);
            await page.$eval(CARD_YEAR_SELECTOR, (el, value) => el.value = value, prefs.cardYear);
            await page.$eval(CARD_VVAL_SELECTOR, (el, value) => el.value = value, prefs.cardVval);

            // await page.evaluate('checkoutAfterCaptcha();');

            // await page.click(TERMS_SELECTOR);

            await page.waitFor(3 * 1000);

            await browser.close();

            finishCallback();
        } catch (e) {
            console.log(e);
            try {
                browser.close();
            } catch (expection) {}
            retryCallback();
        }
    }

    stop () {
        try {
            browser.close();
        } catch (expection) {}
    }
}

exports.BuyProductPuppeteer = BuyProductPuppeteer;