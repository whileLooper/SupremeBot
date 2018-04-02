var request = require('request-promise');

function ADD_URL(productId) {
    return 'https://www.supremenewyork.com/shop/'+productId+'/add.json';
}

class BuyRequest {

    buyProduct (product, styles, prefs, captchaToken, isTesting, finishCallback, retryCallback) {
        const styleId = styles[0].id;
        const sizeId = styles[0].sizes[0];
        this.addToCart (product.id, styleId, sizeId);
    }

    addToCart (productId, styleId, sizeId, callback) {
        payload = {
            size: sizeId,
            style: styleId,
            qty: 1
        }
        request(ADD_URL(productId))
        .then(function (body) {
            console.log(body);
            callback(body);
        })
        .catch(function (err) {
            callback(null);
        });
    }

    checkout () {

    }
}

exports.BuyRequest = BuyRequest;