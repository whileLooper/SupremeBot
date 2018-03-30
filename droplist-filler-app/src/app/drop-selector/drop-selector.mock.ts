import { Product } from "./drop-selector.model";

export const PRODUCTS_PART: Product[] = [
    {
        name: "coolio",
        id: "1",
        price: 123,
        votePositive: 1000,
        voteNegative: 2000,
        imageUrl: "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/673a7a2dce8c499e821932e7d968581f_sqr.jpg"
    },
    {
        name: "coolio 2",
        id: "1",
        price: 1234,
        votePositive: 1000,
        voteNegative: 2000,
        imageUrl: "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/673a7a2dce8c499e821932e7d968581f_sqr.jpg"
    },
    {
        name: "coolio 3",
        id: "1",
        price: 1234,
        votePositive: 1000,
        voteNegative: 2000,
        imageUrl: "https://www.supremecommunity.com/u/season/spring-summer2018/jackets/673a7a2dce8c499e821932e7d968581f_sqr.jpg"
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

export const DROPLIST: Product[] = [
    ...PRODUCTS_PART,
]