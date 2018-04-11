var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var looksSame = require('looks-same');
var request = require('request').defaults({
    //timeout: 30000
});

const BASE_URL = 'http://www.supremenewyork.com';
const SHOP_URL = BASE_URL + '/shop/all'

var api = {};

api.url = 'http://www.supremenewyork.com';

String.prototype.capitalizeEachWord = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

api.getItems = function (category, callback) {

    var getURL = api.url + '/shop/all/' + category;
    if (category === 'all' || !category) {
        getURL = api.url + '/shop/all';
    } else if (category === 'new') {
        getURL = api.url + '/shop/new';
    }

    request(getURL, function (err, resp, html, rrr, body) {

        if (err) {
            console.log('err')
            return callback('No response from website', null);
        }

        var $ = cheerio.load(html);

        var count = $('img').length;

        if (count === 0) {
            return callback('Can not retrieve items. Maybe the category is wrong...', null);
        }

        var parsedResults = [];

        // console.log(len);
        $('img').each(function (i, element) {

            var nextElement = $(this).next();
            var image = "https://" + $(this).attr('src').substring(2);
            var title = $(this).attr('alt');
            var availability = nextElement.text().capitalizeEachWord();
            var link = api.url + this.parent.attribs.href;
            var sizesAvailable;

            if (availability == "") availability = "Available";

            request(link, function (err, resp, html, rrr, body) {

                if (err) {
                    return callback('No response from website', null);
                } else {
                    var $ = cheerio.load(html);
                }

                var addCartURL = api.url + $('form[id="cart-addf"]').attr('action');

                if (availability == "Sold Out") {
                    addCartURL = null;
                }

                var sizeOptionsAvailable = [];
                if ($('option')) {
                    $('option').each(function (i, elem) {
                        var size = {
                            id: parseInt($(this).attr('value')),
                            size: $(this).text(),
                        }
                        sizeOptionsAvailable.push(size);
                    });

                    if (sizeOptionsAvailable.length > 0) {
                        sizesAvailable = sizeOptionsAvailable
                    } else {
                        sizesAvailable = null
                    }
                } else {
                    sizesAvailable = null;
                }

                var metadata = {
                    title: $('h1').attr('itemprop', 'name').eq(1).html(),
                    style: $('.style').attr('itemprop', 'model').text(),
                    link: link,
                    description: $('.description').text(),
                    addCartURL: addCartURL,
                    price: parseInt(($('.price')[0].children[0].children[0].data).replace('$', '').replace(',', '')),
                    image: image,
                    sizesAvailable: sizesAvailable,
                    images: [],
                    availability: availability
                };

                // Some items don't have extra images (like some of the skateboards)
                if ($('.styles').length > 0) {
                    var styles = $('.styles')[0].children;
                    for (li in styles) {
                        for (a in styles[li].children) {
                            if (styles[li].children[a].attribs['data-style-name'] == metadata.style) {
                                metadata.images.push('https:' + JSON.parse(styles[li].children[a].attribs['data-images']).zoomed_url)
                            }
                        }
                    }
                } else if (title.indexOf('Skateboard') != -1) {
                    // Because fuck skateboards
                    metadata.images.push('https:' + $('#img-main').attr('src'))
                }

                parsedResults.push(metadata);

                if (!--count) {
                    callback(parsedResults, null);
                }

            })

        });
    });
};

api.getItem = function (itemURL, callback) {

    request(itemURL, function (err, resp, html, rrr, body) {

        if (err) {
            return callback('No response from website', null);
        } else {
            var $ = cheerio.load(html);
        }

        var sizeOptionsAvailable = [];
        if ($('option')) {
            $('option').each(function (i, elem) {
                var size = {
                    id: parseInt($(this).attr('value')),
                    size: $(this).text(),
                }
                sizeOptionsAvailable.push(size);
            });

            if (sizeOptionsAvailable.length > 0) {
                sizesAvailable = sizeOptionsAvailable
            } else {
                sizesAvailable = null
            }
        } else {
            sizesAvailable = null;
        }

        var availability;
        var addCartURL = api.url + $('form[id="cart-addf"]').attr('action');

        var addCartButton = $('input[value="add to cart"]')
        if (addCartButton.attr('type') == '') {
            availability = 'Available'
        } else {
            availability = 'Sold Out'
        }

        if (availability == 'Sold Out') {
            addCartURL = null
        }

        var metadata = {
            title: $('h1').attr('itemprop', 'name').eq(1).html(),
            style: $('.style').attr('itemprop', 'model').text(),
            link: itemURL,
            description: $('.description').text(),
            addCartURL: addCartURL,
            price: parseInt(($('.price')[0].children[0].children[0].data).replace('$', '').replace(',', '')),
            image: 'http:' + $('#img-main').attr('src'),
            sizesAvailable: sizesAvailable,
            images: [],
            availability: availability
        };

        // Some items don't have extra images (like some of the skateboards)
        if ($('.styles').length > 0) {
            var styles = $('.styles')[0].children;
            for (li in styles) {
                for (a in styles[li].children) {
                    if (styles[li].children[a].attribs['data-style-name'] == metadata.style) {
                        metadata.images.push('https:' + JSON.parse(styles[li].children[a].attribs['data-images']).zoomed_url)
                    }
                }
            }
        } else if (title.indexOf('Skateboard') != -1) {
            metadata.images.push('https:' + $('#img-main').attr('src'))
        }

        callback(null, metadata);
    });
};

api.watchOnAllItems = [];
api.watchAllItems = function (interval, category, callback) {
    api.log('Now watching for all items');
    api.watchOnAllItems = setInterval(function () {
        api.getItems(category, function (items) {
            callback(items, null);
        });
    }, 1000 * interval); // Every xx sec
};

api.stopWatchingAllItems = function (callback) {
    clearInterval(api.watchOnAllItems);
    if (api.watchOnAllItems == "") {
        callback(null, 'No watching processes found.');
    } else {
        callback('Watching has stopped.', null);
    }
};

api.findItem = function (category, keywords, mainCallback) {
    category = category ? category.toLowerCase() : null;
    keywords = keywords ? keywords.toLowerCase() : null;
    if (!keywords || !category)
        return callback(null);

    var url = SHOP_URL + '/' + category;
    request(url, function (err, resp, html) {
        var $ = cheerio.load(html);
        var newProduct = null;
        $('article').each(function (i, element) {
            const name = $(this).find('h1 .name-link').text().toLowerCase();
            if (keywords.split(" ").every(keyword => name.includes(keyword)) &&
                $(this).find('sold_out_tag').text() == "") {
                if (!newProduct) {
                    newProduct = {
                        name: name,
                        styles: [],
                    }
                }

                var styleUrl = BASE_URL + '/' + $(this).find('h1 .name-link').attr('href');
                var styleName = $(this).find('p .name-link').text().toLowerCase();
                newProduct.styles.push({ name: styleName, id: styleUrl });

            }
        });

        if (!newProduct)
            return mainCallback(null);

        var styles = [];
        async.each(newProduct.styles, function (style, callback) {
            getSizes(style.id, (sizes) => {
                style.sizes = sizes;
                styles.push(style);
                callback();
            });
        }, (err) => {
            newProduct.styles = styles;
            mainCallback(newProduct);
        });
    });
}

function getSizes(url, callback) {
    request(url, function (err, resp, html) {
        var $ = cheerio.load(html);
        var sizes = [];
        if ($('input#size').length) {
            const size = {
                id: $('#size').attr('value'),
                name: "one-size",
                stock_level: 1,
            }
            sizes.push(size);
        } else {
            $('select#size option').each(function (i, element) {
                const name = $(this).text();
                const id = $(this).attr('value');
                sizes.push(
                    {
                        name: name,
                        id: id,
                        stock_level: 1,
                    });
            });
        }
        callback(sizes);
    });
}

api.seek = function (category, keywords, styleSelection, callback) {
    category = category ? category.toLowerCase() : null;
    keywords = keywords ? keywords.toLowerCase() : null;
    styleSelection = styleSelection ? styleSelection.toLowerCase() : null;
    api.getItems(category, (product, err) => {

        if (err || !product) {
            return callback(null, 'Error occured while trying to seek for items.');
        }

        for (i = 0; i < product.length; i++) {
            var title = product[i].title;
            if (!title) {
                console.log("Error occurred, retrieved, missing product informations", product[i]);
                continue;
            }

            title = title.replace(/&#xFEFF;/g, '').replace(/&#xAE;/g, '®').toLowerCase();
            var style = product[i].style;
            style = encodeURI(style);
            style = style.replace(/%EF%BB%BF/g, "");
            style = decodeURI(style).toLowerCase();

            if (style === null) {
                if (title.indexOf(keywords) > -1) {
                    return callback(product[i], null);
                } else {
                    continue;
                }
            } else if (!styleSelection || style.indexOf(styleSelection) > -1) {
                if (title.indexOf(keywords) > -1) {
                    return callback(product[i], null);
                } else {
                    continue;
                }
            }
        }

        return callback(null, "Could not find any results matching your keywords.");

    });
};

api.seekByImage = function (image, callback) {
    var url = api.url + '/shop/all';

    request(url, function (error, response, body) {

        var $ = cheerio.load(body);
        var length = $('img').length;

        $('img').each(() => {
            if (length <= 0)
                return false;

            var foundImage = "https://" + $(this).attr('src').substring(2);
            var nextElement = $(this).next();
            var product = {
                title: $(this).attr('alt'),
                isAvailable: nextElement.text() === "",
                link: api.url + this.parent.attribs.href
            };

            looksSame(image, foundImage, function (error, equal) {
                if (equal) {
                    callback(product);
                    length = -1;
                } else {
                    length--;
                    if (length <= 0) {
                        callback(null);
                    }
                }
            });
        });
    });

}

api.log = function (message) {
    console.log('[supreme api] ' + message);
};

if (typeof require != 'undefined' && require.main == module) {
    api.findItem("accessories", "night lite", result => {
        result.styles.forEach(item => console.log(item));
    });
}

module.exports = api;
