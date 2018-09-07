var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var looksSame = require('looks-same');
var request = require('request');

const BASE_URL = 'http://www.supremenewyork.com';
const SHOP_URL = BASE_URL + '/shop/all'

var api = {};

api.url = 'http://www.supremenewyork.com';

api.findItem = function (category, keywords, mainCallback) {
    category = category ? category.toLowerCase() : "";
    category = category == "" ? "bags" : category;
    category = category == "tops-sweater" ? "tops_sweaters" : category;
    keywords = keywords ? keywords.toLowerCase() : null;
    if (!keywords)
        return mainCallback(null);

    var url = SHOP_URL + '/' + category;
    request(url, function (err, resp, html) {
        var $ = cheerio.load(html);
        var newProduct = null;
        console.log('Search for articles!');
        $('article').each(function (i, element) {
            const name = $(this).find('h1 .name-link').text().toLowerCase();
            console.log('Found article:', name);
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

if (typeof require != 'undefined' && require.main == module) {
    api.findItem("accessories", "night lite", result => {
        result.styles.forEach(item => console.info(item));
    });
}

module.exports = api;
