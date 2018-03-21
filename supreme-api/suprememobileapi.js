const request = require('request-promise');

var api = {};
api.findItem = function (category, keywords, callback) {
    if (!keywords)
        return callback(null);

    keywords = keywords.toLowerCase();
    category = category ? category.toLowerCase() : null;
    const opts = {
        method: 'GET',
        json: true,
        uri: `http://www.supremenewyork.com/mobile_stock.json`,
        headers: {
            'Accept': 'application/json'
        }
    }

    request(opts)
        .then(json => {
            const categories = json.products_and_categories;
            var foundItem = Object.keys(categories).some(categoryKey => {
                if (categoryKey.toLowerCase() == category || category == 'all' || !category) {
                    return categories[categoryKey].some(product => {
                        var name = encodeURI(product.name);
                        name = name.replace(/%EF%BB%BF/g, "");
                        name = decodeURI(name).toLowerCase();
                        if (keywords.split(" ").every (keyword => name.includes(keyword))) {
                            product.name = name;
                            api.getItem (product.id, product.name, callback);
                            return true;
                        }
                    })
                }
            });
            if (!foundItem)
                callback(null);
        });
};

api.getItem = function (id, name, callback) {
    const opts = {
        method: 'GET',
        json: true,
        uri: 'https://www.supremenewyork.com/shop/'+id+'.json',
        headers: {
            'Accept': 'application/json'
        }
    }

    request(opts)
        .then(json => {
            json.name = name;
            json.id = id;
            callback (json);
        });
}

module.exports = api;