var request = require('request');
const cheerio = require('cheerio');

function ADD_URL(productId) {
    return 'https://www.supremenewyork.com/shop/' + productId + '/add.json';
}
const SHOP_URL = "https://www.supremenewyork.com/shop";
const CHECKOUT_PAGE_URL = "https://www.supremenewyork.com/checkout";
const CHECKOUT_URL = "https://www.supremenewyork.com/checkout.json";

class BuyRequest {

    async buyProduct(product, styles, prefs, captchaToken, isTesting, finishCallback, retryCallback) {
        console.log("Mid   Time: " + new Date().toUTCString());
        this.j = request.jar()
        const styleId = styles[0].id;
        const sizeId = styles[0].sizes[0];
        try {
            const csrfToken = await this.requestCsrfToken();
            await this.sleep(350);
            await this.addToCart(product.id, styleId, sizeId, csrfToken);
            await this.sleep(350);
            await this.requestCheckoutSite();
            await this.sleep(3300);
            await this.checkout(sizeId, prefs, captchaToken, csrfToken, isTesting);
            console.log("End   Time: " + new Date().toUTCString());
            finishCallback(true);
        } catch (e) {
            console.log(e);
            retryCallback();
        }
    }

    sleep(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), ms);
        });
    }

    requestCsrfToken() {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                uri: SHOP_URL,
                jar: this.j,
            };

            request(options, (error, response, body) => {
                const $ = cheerio.load(body);
                const csrfToken = $('[name="csrf-token"]').attr('content');
                console.log(csrfToken);
                resolve(csrfToken);
            });
        });
    }

    addToCart(productId, styleId, sizeId, csrfToken) {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                uri: ADD_URL(productId),
                body: {
                    size: sizeId,
                    style: styleId,
                    qty: 1
                },
                headers: {
                    "x-csrf-token": csrfToken,
                    "X-Requested-With": "XMLHttpRequest"
                },
                jar: this.j,
                json: true
            };

            request(options, (error, response, body) => {
                console.log(body);
                if (body.length > 0 && body[0].in_stock)
                    resolve(body);
                else
                    reject(false);
            });
        });
    }

    requestCheckoutSite() {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                uri: CHECKOUT_PAGE_URL,
                jar: this.j,
            };

            request(options, (error, response, body) => resolve());
        });
    }

    checkout(sizeId, prefs, captchaToken, csrfToken, isTesting) {
        return new Promise((resolve, reject) => {
            const cookieSub = encodeURI("{\"" + sizeId + "\":1}");
            var formData = {
                "utf8": "✓",
                "authenticity_token": csrfToken,
                "store_credit_id": "",
                //"cookie-sub": cookieSub,
                "order[billing_name]": prefs.name,
                "order[email]": prefs.email,
                "order[tel]": prefs.tel,
                "order[billing_address]": prefs.adress,
                "order[billing_address_2]": "",
                "order[billing_address_3]": "",
                "order[billing_city]": prefs.city,
                "order[billing_zip]": prefs.zip,
                "order[billing_country]": prefs.country,
                "same_as_billing_address": "1",
                "credit_card[type]": prefs.cardType,
                "credit_card[cnb]": prefs.cardNumber,
                "credit_card[month]": prefs.cardMonth,
                "credit_card[year]": prefs.cardYear,
                "credit_card[vval]": prefs.cardVval,
                "order[terms]": isTesting ? "0" : "1",
                "g-recaptcha-response": captchaToken
            }

            const options = {
                method: 'POST',
                uri: CHECKOUT_URL,
                formData: formData,
                jar: this.j,
                headers: {
                    "x-csrf-token": csrfToken,
                    "X-Requested-With": "XMLHttpRequest"
                },
            };

            request(options, (error, response, body) => {
                console.log(body);
                body = JSON.parse(body);
                if (isTesting || (body.status != "failed" && body.status != "outOfStock"))
                    resolve(body);
                else
                    reject(true);
            });
        });
    }

    stop() {

    }
}

exports.BuyRequest = BuyRequest;