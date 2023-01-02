export type GameData =
{
    name:string,
    price:number,
    provider:string,
    link:string,
    img:string,
    id?:number
};



export type NewGameData =
{
    name:string,
    price:number,
    provider:string,
    link:string,
    img:string,
    vendor_id:number,
    expires_at:string
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


export type ErrorData =
{
    type:number,
    id:number
}