export interface Product {
    name:string,
    id:string,
    price: number,
    votePositive: number,
    voteNegative: number,
    imageUrl:string,
    sizes:string[],
    styles:string[]
}