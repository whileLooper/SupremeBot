const puppeteer = require('puppeteer');

class BuyOnMobile {

    async buyProduct(product, styles, prefs, captchaToken, isTesting, finishCallback, retryCallback) {
        var args = {args: ['--no-sandbox']};
        isTesting ? args.headless = false : args.headless = true;
        var browser = await puppeteer.launch(args);
        try {
            const page = await browser.newPage();
            const style = styles[0];
            await page.goto('https://www.supremenewyork.com/mobile#products/' + product.id + '/' + style.id);

            const ADD_PRODUCT_SELECTOR = '#cart-update > .cart-button';
            //this selector should always be there because it applies on the sold out button too
            await page.waitForSelector(ADD_PRODUCT_SELECTOR);

            const SIZE_SELECTOR = "#size-options";
            const sizeInput = await page.$(SIZE_SELECTOR);
            if (sizeInput) {
                const SIZE_OPTION_SELECTOR = "#size-options > option";
                const choosenSize = await page.$$eval(SIZE_OPTION_SELECTOR, (elems, style) => {
                    return style.sizes.find(size => {
                        return elems.map(elem => elem.value).includes(size);
                    });
                }, style);
                await page.$eval(SIZE_SELECTOR, (el, size) => el.value = size, choosenSize);
            }

            const SOLD_OUT_SELECTOR_SELECTOR = '#cart-update > .cart-button.sold-out';
            const soldOutButton = await page.$(SOLD_OUT_SELECTOR_SELECTOR);
            if (soldOutButton) {
                await browser.close();
                return finishCallback();
            }

            await page.click(ADD_PRODUCT_SELECTOR);

            const CHECKOUT_SELECTOR = '#checkout-now';
            
            await page.waitFor(1 * 250);

            await page.click(CHECKOUT_SELECTOR);


            const MAIN_SELECTOR = '#main';
            const NAME_SELECTOR = '#order_billing_name';
            const EMAIL_SELECTOR = '#order_email';
            const TEL_SELECTOR = '#order_tel';
            const ADRESS_SELECTOR = '#order_billing_address';
            const CITY_SELECTOR = '#order_billing_city';
            const ZIP_SELECTOR = '#order_billing_zip';
            const COUNTRY_SELECTOR = '#order_billing_country';
            const CARD_TYPE_SELECTOR = '#credit_card_type';
            const CARD_NUMBER_SELECTOR = '#credit_card_n';
            const CARD_MONTH_SELECTOR = '#credit_card_month';
            const CARD_YEAR_SELECTOR = '#credit_card_year';
            const CARD_VVAL_SELECTOR = '#credit_card_cvv';
            const TERMS_SELECTOR = '#order_terms'

            await page.waitForSelector(NAME_SELECTOR);

            await page.$eval(MAIN_SELECTOR, el => el.style = "");
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

            const RECAPTCHA_RESPONSE_SELECTOR = '#g-recaptcha-response';
            const htmlElement = htmlToElement("<textarea id=\"g-recaptcha-response\" name=\"g-recaptcha-response\" " +
                "class=\"g-recaptcha-response\" style=\"width: 250px; height: 40px;\"></textarea>");
            await page.evaluate((htmlElement) => {
                document.querySelector("#g-recaptcha").appendChild(htmlElement);
            }, htmlElement);
            await page.$eval(RECAPTCHA_RESPONSE_SELECTOR, (el, value) => el.value = value, captchaToken);

            // await page.evaluate('checkoutAfterCaptcha();');

            // await page.click(TERMS_SELECTOR);

            await page.waitFor(3 * 1000);

            await browser.close();

            finishCallback();
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

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

exports.BuyOnMobile = BuyOnMobile;