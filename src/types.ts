export type GameData =
{
    name:string,
    price:number,
    provider:string,
    link:string,
    img:string
};

export type WikiData =
{
    link:string,
    imgURL:string,
    textInfo:{name:string, value:string}[]
};

export type SearchResult =
{
    gameData:GameData[],
    priceData:GameData[],
    wikiData:WikiData,
    videoId:string
};