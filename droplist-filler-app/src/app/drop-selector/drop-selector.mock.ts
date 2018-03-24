import { Product } from "./drop-selector.model";

export const PRODUCTS_PART: Product[] = [
    {
        name: "coolio",
        price: 123,
        votePositive: 1000,
        voteNegative: 2000,
        images: [
            "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/c9a369ec42f9477bb38f28eb066f07be_sqr.jpg",
            "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/673a7a2dce8c499e821932e7d968581f_sqr.jpg"
        ],
    },
    {
        name: "coolio 2",
        price: 1234,
        votePositive: 1000,
        voteNegative: 2000,
        images: [
            "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/c9a369ec42f9477bb38f28eb066f07be_sqr.jpg",
            "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/673a7a2dce8c499e821932e7d968581f_sqr.jpg"
        ],
    },
    {
        name: "coolio 3",
        price: 1234,
        votePositive: 1000,
        voteNegative: 2000,
        images: [
            "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/673a7a2dce8c499e821932e7d968581f_sqr.jpg",
            "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/c9a369ec42f9477bb38f28eb066f07be_sqr.jpg"
        ],
    }
];

export const PRODUCTS: Product[] = [
    ...PRODUCTS_PART,
    ...PRODUCTS_PART,
    ...PRODUCTS_PART,
    ...PRODUCTS_PART,
    ...PRODUCTS_PART,
    ...PRODUCTS_PART,
    ...PRODUCTS_PART,
    ...PRODUCTS_PART,
    ...PRODUCTS_PART
]