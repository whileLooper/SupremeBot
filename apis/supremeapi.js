var cheerio = require('cheerio');
var request = require('request');
var looksSame = require('looks-same');
var request = require('request').defaults({
    //timeout: 30000
});

var api = {};

api.url = 'http://www.supremenewyork.com';

String.prototype.capitalizeEachWord = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

api.getItems = function (category, callback) {

    var getURL = api.url + '/shop/all/' + category;
    if (category === 'all') {
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

        if ($('.shop-closed').length > 0) {
            return callback('Store Closed', null);
        } else if (count === 0) {
            return callback('Store Closed', null);
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

module.exports = api;