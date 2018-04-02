var request = require('request');

function ADD_URL(productId) {
    return 'https://www.supremenewyork.com/shop/' + productId + '/add.json';
}
const CHECKOUT_URL = "https://www.supremenewyork.com/checkout.json";

class BuyRequest {

    async buyProduct(product, styles, prefs, captchaToken, isTesting, finishCallback, retryCallback) {
        console.log("Mid   Time: " + new Date().toUTCString());
        this.j = request.jar()
        const styleId = styles[0].id;
        const sizeId = styles[0].sizes[0];
        try {
            await this.sleep(500);
            await this.addToCart(product.id, styleId, sizeId);
            await this.sleep(1000);
            await this.checkout(sizeId, prefs, captchaToken, isTesting);
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

    addToCart(productId, styleId, sizeId) {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                uri: ADD_URL(productId),
                body: {
                    size: sizeId,
                    style: styleId,
                    qty: 1
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

    checkout(sizeId, prefs, captchaToken, isTesting) {
        return new Promise((resolve, reject) => {
            const cookieSub = encodeURI("{\""+sizeId+"\":1}");
            const formData = {
                "store_credit_id": "",
                "from_mobile": "1",
                "cookie-sub": cookieSub,
                "same_as_billing_address": "1",
                "order[billing_name]": prefs.name,
                "order[email]": prefs.email,
                "order[tel]": prefs.tel,
                "order[billing_address]": prefs.adress,
                "order[billing_address_2]": "",
                "order[billing_address_3]": "",
                "order[billing_city]": prefs.city,
                "order[billing_zip]": prefs.zip,
                "order[billing_country]": prefs.country,
                "credit_card[type]": prefs.cardType,
                "credit_card[cnb]": prefs.cardNumber,
                "credit_card[month]": prefs.cardMonth,
                "credit_card[year]": prefs.cardYear,
                "credit_card[vval]": prefs.cardVval,
                "order[terms]": "0",
                "g-recaptcha-response": captchaToken
            }

            const options = {
                method: 'POST',
                uri: CHECKOUT_URL,
                formData: formData,
                jar: this.j
            };

            request(options, (error, response, body) => {
                console.log(body);
                body = JSON.parse(body);
                if (body.status != "failed" && body.status != "outOfStock")
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